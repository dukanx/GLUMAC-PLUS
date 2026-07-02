package com.example.glumac_plus_android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.glumac_plus_android.data.model.StatusPorudzbine
import com.example.glumac_plus_android.data.remote.ApiClient
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

// Prati status porudžbine POLLING-om.
// Angular ekvivalent: RxJS timer(0, 8000).pipe(switchMap(getJedan)) + takeWhile.
// Ovde: coroutine `while (isActive) { fetch; delay(8000) }` — prekida se kad je porudžbina završena.
class StatusViewModel : ViewModel() {

    private val api = ApiClient.service

    private val _status = MutableStateFlow<StatusPorudzbine?>(null)
    val status: StateFlow<StatusPorudzbine?> = _status.asStateFlow()

    private val _procenjenoVreme = MutableStateFlow<Int?>(null)
    val procenjenoVreme: StateFlow<Int?> = _procenjenoVreme.asStateFlow()

    private val _greska = MutableStateFlow(false)
    val greska: StateFlow<Boolean> = _greska.asStateFlow()

    private var job: Job? = null

    fun pokreni(bearer: String, id: Long) {
        job?.cancel()
        job = viewModelScope.launch {
            while (isActive) {
                try {
                    val p = api.porudzbina(bearer, id)
                    _status.value = p.status
                    _procenjenoVreme.value = p.procenjenoVreme
                    // Prestani da pollujemo kad je gotovo/otkazano (kao Angular takeWhile)
                    if (p.status == StatusPorudzbine.REALIZOVANA || p.status == StatusPorudzbine.OTKAZANA) break
                } catch (e: Exception) {
                    _greska.value = true
                }
                delay(8000)
            }
        }
    }

    override fun onCleared() {
        job?.cancel()
    }
}
