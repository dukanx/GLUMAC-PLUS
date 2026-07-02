package com.example.glumac_plus_android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.glumac_plus_android.data.model.PorudzbinaRequest
import com.example.glumac_plus_android.data.model.Proizvod
import com.example.glumac_plus_android.data.model.StavkaKorpe
import com.example.glumac_plus_android.data.model.StavkaZahtev
import com.example.glumac_plus_android.data.model.TipPorudzbine
import com.example.glumac_plus_android.data.remote.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import retrofit2.HttpException
import kotlin.math.roundToInt

// Deljeno stanje korpe — paralela Angular CartService.
// Da bi bio DELJEN između ekrana (Meni, Korpa...), kreira se JEDNOM na nivou Activity-ja
// (u MainActivity) i prosleđuje kroz AppNav — kao AuthViewModel.
class CartViewModel : ViewModel() {

    private val _korpa = MutableStateFlow<List<StavkaKorpe>>(emptyList())
    val korpa: StateFlow<List<StavkaKorpe>> = _korpa.asStateFlow()

    fun dodaj(proizvod: Proizvod) {
        val postoji = _korpa.value.any { it.proizvod.id == proizvod.id }
        _korpa.value = if (postoji) {
            _korpa.value.map {
                if (it.proizvod.id == proizvod.id) it.copy(kolicina = it.kolicina + 1) else it
            }
        } else {
            _korpa.value + StavkaKorpe(proizvod, 1)
        }
    }

    fun povecaj(id: Long) {
        _korpa.value = _korpa.value.map {
            if (it.proizvod.id == id) it.copy(kolicina = it.kolicina + 1) else it
        }
    }

    fun smanji(id: Long) {
        // Umanji pa izbaci stavke sa količinom 0 (kao Angular smanji)
        _korpa.value = _korpa.value
            .map { if (it.proizvod.id == id) it.copy(kolicina = it.kolicina - 1) else it }
            .filter { it.kolicina > 0 }
    }

    fun ukloni(id: Long) {
        _korpa.value = _korpa.value.filter { it.proizvod.id != id }
    }

    fun isprazni() {
        _korpa.value = emptyList()
    }

    fun kolicinaZa(id: Long): Int = _korpa.value.find { it.proizvod.id == id }?.kolicina ?: 0

    val ukupnoStavki: Int get() = _korpa.value.sumOf { it.kolicina }
    val ukupnaCena: Int get() = _korpa.value.sumOf { it.proizvod.cena * it.kolicina }.roundToInt()

    // ── Naručivanje ──
    private val _porucivanje = MutableStateFlow(false)
    val porucivanje: StateFlow<Boolean> = _porucivanje.asStateFlow()

    private val _greskaPorudzbine = MutableStateFlow<String?>(null)
    val greskaPorudzbine: StateFlow<String?> = _greskaPorudzbine.asStateFlow()

    // bearer = "Bearer <token>"; onUspeh dobija ID nove porudžbine (za budući Status ekran).
    fun naruci(bearer: String, tip: TipPorudzbine, napomena: String?, onUspeh: (Long) -> Unit) {
        viewModelScope.launch {
            _porucivanje.value = true
            _greskaPorudzbine.value = null
            try {
                val zahtev = PorudzbinaRequest(
                    tipPorudzbine = tip,
                    napomena = napomena?.ifBlank { null },
                    stavke = _korpa.value.map { StavkaZahtev(it.proizvod.id, it.kolicina) }
                )
                val res = ApiClient.service.kreirajPorudzbinu(bearer, zahtev)
                isprazni()
                onUspeh(res.porudzbinaId)
            } catch (e: Exception) {
                _greskaPorudzbine.value = porukaGreske(e)
            } finally {
                _porucivanje.value = false
            }
        }
    }

    private val json = Json { ignoreUnknownKeys = true }

    private fun porukaGreske(e: Throwable): String {
        if (e is HttpException) {
            val body = runCatching { e.response()?.errorBody()?.string() }.getOrNull()
            if (!body.isNullOrBlank()) {
                val m = runCatching { json.decodeFromString<ApiGreska>(body).message }.getOrNull()
                if (!m.isNullOrBlank()) return m
            }
        }
        return "Greška prilikom naručivanja."
    }

    @Serializable
    private data class ApiGreska(val message: String? = null)
}
