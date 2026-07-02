package com.example.glumac_plus_android.viewmodel

import androidx.lifecycle.ViewModel
import com.example.glumac_plus_android.data.model.Proizvod
import com.example.glumac_plus_android.data.model.StavkaKorpe
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
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
}
