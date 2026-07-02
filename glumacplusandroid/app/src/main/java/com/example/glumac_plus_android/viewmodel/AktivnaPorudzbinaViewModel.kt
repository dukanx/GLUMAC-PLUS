package com.example.glumac_plus_android.viewmodel

import android.app.Application
import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

// Angular ekvivalent: AktivnaPorudzbinaService (+ localStorage).
// Globalno pamti ID trenutne aktivne porudžbine da bi FloatingBubble mogao da je prati sa bilo kog ekrana.
private val Context.aktivnaDataStore by preferencesDataStore(name = "aktivna")

class AktivnaPorudzbinaViewModel(app: Application) : AndroidViewModel(app) {

    private val store = app.aktivnaDataStore
    private val KEY = longPreferencesKey("aktivnaId")

    private val _aktivnaId = MutableStateFlow<Long?>(null)
    val aktivnaId: StateFlow<Long?> = _aktivnaId.asStateFlow()

    init {
        viewModelScope.launch {
            _aktivnaId.value = store.data.map { it[KEY] }.first()
        }
    }

    fun postavi(id: Long) {
        _aktivnaId.value = id
        viewModelScope.launch { store.edit { it[KEY] = id } }
    }

    fun ocisti() {
        _aktivnaId.value = null
        viewModelScope.launch { store.edit { it.remove(KEY) } }
    }
}
