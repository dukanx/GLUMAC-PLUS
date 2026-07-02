package com.example.glumac_plus_android.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.glumac_plus_android.data.local.TokenStore
import com.example.glumac_plus_android.data.model.Korisnik
import com.example.glumac_plus_android.data.model.LoginRequest
import com.example.glumac_plus_android.data.model.RegisterRequest
import com.example.glumac_plus_android.data.remote.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import retrofit2.HttpException

// AndroidViewModel = ViewModel koji ima pristup Application context-u (treba nam za DataStore).
// StateFlow = reaktivno stanje koje UI čita preko collectAsState() (ekvivalent BehaviorSubject-a).
class AuthViewModel(app: Application) : AndroidViewModel(app) {

    private val api = ApiClient.service
    private val tokenStore = TokenStore(app)
    private val json = Json { ignoreUnknownKeys = true }

    // _xxx = privatno, promenljivo; xxx = javno, read-only (isti obrazac kao Angular private Subject + public Observable).
    private val _korisnik = MutableStateFlow<Korisnik?>(null)
    val korisnik: StateFlow<Korisnik?> = _korisnik.asStateFlow()

    private val _token = MutableStateFlow<String?>(null)
    val token: StateFlow<String?> = _token.asStateFlow()

    private val _greska = MutableStateFlow<String?>(null)
    val greska: StateFlow<String?> = _greska.asStateFlow()

    private val _ucitava = MutableStateFlow(false)
    val ucitava: StateFlow<Boolean> = _ucitava.asStateFlow()

    val jeUlogovan: Boolean get() = _token.value != null
    private val bearer: String? get() = _token.value?.let { "Bearer $it" }

    init {
        // Učitaj sačuvani token/korisnika iz DataStore-a pri startu (kao Angular čitanje iz localStorage-a).
        viewModelScope.launch {
            _token.value = tokenStore.token.first()
            tokenStore.korisnikJson.first()?.let { js ->
                runCatching { _korisnik.value = json.decodeFromString<Korisnik>(js) }
            }
        }
    }

    fun login(email: String, lozinka: String, onUspeh: () -> Unit) {
        viewModelScope.launch {
            _ucitava.value = true
            _greska.value = null
            try {
                val res = api.login(LoginRequest(email, lozinka))
                _token.value = res.token
                _korisnik.value = res.korisnik
                tokenStore.sacuvaj(res.token, json.encodeToString(res.korisnik))
                onUspeh()
            } catch (e: Exception) {
                _greska.value = poruka(e, "Pogrešan email ili lozinka.")
            } finally {
                _ucitava.value = false
            }
        }
    }

    fun register(ime: String, email: String, lozinka: String, onUspeh: () -> Unit) {
        viewModelScope.launch {
            _ucitava.value = true
            _greska.value = null
            try {
                api.register(RegisterRequest(ime, email, lozinka))
                onUspeh()
            } catch (e: Exception) {
                _greska.value = poruka(e, "Došlo je do greške. Pokušajte ponovo.")
            } finally {
                _ucitava.value = false
            }
        }
    }

    fun osvezi() {
        val auth = bearer ?: return
        viewModelScope.launch {
            runCatching {
                val k = api.me(auth)
                _korisnik.value = k
                tokenStore.sacuvaj(_token.value!!, json.encodeToString(k))
            }
        }
    }

    fun logout() {
        _token.value = null
        _korisnik.value = null
        viewModelScope.launch { tokenStore.obrisi() }
    }

    fun ocistiGresku() { _greska.value = null }

    // Pokušaj da izvučeš backend poruku iz errorBody-ja (npr. "email već postoji"); inače fallback.
    private fun poruka(e: Throwable, fallback: String): String {
        if (e is HttpException) {
            val body = runCatching { e.response()?.errorBody()?.string() }.getOrNull()
            if (!body.isNullOrBlank()) {
                val m = runCatching { json.decodeFromString<ApiGreska>(body).message }.getOrNull()
                if (!m.isNullOrBlank()) return m
            }
        }
        return fallback
    }

    @Serializable
    private data class ApiGreska(val message: String? = null)
}
