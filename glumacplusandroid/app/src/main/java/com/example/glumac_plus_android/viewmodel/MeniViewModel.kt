package com.example.glumac_plus_android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.glumac_plus_android.data.model.Proizvod
import com.example.glumac_plus_android.data.remote.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// Običan ViewModel (ne AndroidViewModel) — proizvodi su javni endpoint, ne treba Context/token.
class MeniViewModel : ViewModel() {

    private val api = ApiClient.service

    private val _proizvodi = MutableStateFlow<List<Proizvod>>(emptyList())
    val proizvodi: StateFlow<List<Proizvod>> = _proizvodi.asStateFlow()

    private val _ucitava = MutableStateFlow(true)
    val ucitava: StateFlow<Boolean> = _ucitava.asStateFlow()

    private val _greska = MutableStateFlow<String?>(null)
    val greska: StateFlow<String?> = _greska.asStateFlow()

    init { ucitaj() }

    fun ucitaj() {
        viewModelScope.launch {
            _ucitava.value = true
            _greska.value = null
            try {
                _proizvodi.value = api.proizvodi()
            } catch (e: Exception) {
                _greska.value = "Ne mogu da učitam meni."
            } finally {
                _ucitava.value = false
            }
        }
    }
}
