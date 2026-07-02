package com.example.glumac_plus_android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.glumac_plus_android.data.model.Porudzbina
import com.example.glumac_plus_android.data.model.StatusPorudzbine
import com.example.glumac_plus_android.data.remote.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class IstorijaViewModel : ViewModel() {

    private val api = ApiClient.service

    private val _porudzbine = MutableStateFlow<List<Porudzbina>>(emptyList())
    val porudzbine: StateFlow<List<Porudzbina>> = _porudzbine.asStateFlow()

    private val _ucitava = MutableStateFlow(true)
    val ucitava: StateFlow<Boolean> = _ucitava.asStateFlow()

    private val _greska = MutableStateFlow<String?>(null)
    val greska: StateFlow<String?> = _greska.asStateFlow()

    fun ucitaj(bearer: String) {
        viewModelScope.launch {
            _ucitava.value = true
            _greska.value = null
            try {
                // /moje vraća Page — uzimamo content. (Paginaciju možemo dodati kasnije; za sad prvih 50.)
                _porudzbine.value = api.mojePorudzbine(bearer, page = 0, size = 50).content
            } catch (e: Exception) {
                _greska.value = "Nije moguće učitati istoriju."
            } finally {
                _ucitava.value = false
            }
        }
    }

    fun otkazi(bearer: String, id: Long) {
        viewModelScope.launch {
            runCatching {
                val res = api.otkaziPorudzbinu(bearer, id)
                if (res.isSuccessful) {
                    // Lokalno obeleži kao OTKAZANA (bez ponovnog učitavanja) — kao Angular.
                    _porudzbine.value = _porudzbine.value.map {
                        if (it.porudzbinaId == id) it.copy(status = StatusPorudzbine.OTKAZANA) else it
                    }
                }
            }
        }
    }
}
