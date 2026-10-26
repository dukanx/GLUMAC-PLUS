package com.example.glumac_plus_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.glumac_plus_android.ui.auth.LoginScreen
import com.example.glumac_plus_android.ui.theme.GlumacplusandroidTheme
import com.example.glumac_plus_android.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GlumacplusandroidTheme {
                // viewModel() daje (i pamti) instancu AuthViewModel-a; collectAsState pretvara StateFlow u Compose state.
                val auth: AuthViewModel = viewModel()
                val korisnik by auth.korisnik.collectAsState()

                Scaffold(modifier = Modifier.fillMaxSize()) { padding ->
                    Box(Modifier.padding(padding)) {
                        // Privremeno: ako je ulogovan pokaži ime, inače Login. Prava navigacija dolazi kasnije.
                        if (korisnik == null) {
                            LoginScreen(auth)
                        } else {
                            UlogovanEkran(ime = korisnik!!.ime, onOdjava = { auth.logout() })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun UlogovanEkran(ime: String, onOdjava: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Ulogovan kao", style = MaterialTheme.typography.labelMedium)
        Text(ime, style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(20.dp))
        Button(onClick = onOdjava) { Text("Odjavi se") }
    }
}
