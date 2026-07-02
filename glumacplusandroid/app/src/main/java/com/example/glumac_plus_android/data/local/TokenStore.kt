package com.example.glumac_plus_android.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// DataStore instanca vezana za Context (jedna po aplikaciji). Ekvivalent localStorage-a iz web verzija.
private val Context.authDataStore by preferencesDataStore(name = "auth")

// Čuva token i korisnika (kao JSON string) trajno — preživljava zatvaranje aplikacije.
class TokenStore(private val context: Context) {

    private companion object {
        val TOKEN = stringPreferencesKey("token")
        val KORISNIK = stringPreferencesKey("korisnik")
    }

    // Flow = reaktivni tok vrednosti (ekvivalent Observable-a). Emituje na svaku promenu.
    val token: Flow<String?> = context.authDataStore.data.map { it[TOKEN] }
    val korisnikJson: Flow<String?> = context.authDataStore.data.map { it[KORISNIK] }

    suspend fun sacuvaj(token: String, korisnikJson: String) {
        context.authDataStore.edit { prefs ->
            prefs[TOKEN] = token
            prefs[KORISNIK] = korisnikJson
        }
    }

    suspend fun obrisi() {
        context.authDataStore.edit { it.clear() }
    }
}
