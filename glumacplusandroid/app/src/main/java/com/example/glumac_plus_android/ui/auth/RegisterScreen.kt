package com.example.glumac_plus_android.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.glumac_plus_android.viewmodel.AuthViewModel

@Composable
fun RegisterScreen(auth: AuthViewModel, onIdiNaLogin: () -> Unit) {
    var ime by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var lozinka by remember { mutableStateOf("") }
    var potvrda by remember { mutableStateOf("") }

    // Greške po polju — lokalno stanje (ekvivalent React `greske` objekta).
    var greskaIme by remember { mutableStateOf<String?>(null) }
    var greskaEmail by remember { mutableStateOf<String?>(null) }
    var greskaLozinka by remember { mutableStateOf<String?>(null) }
    var greskaPotvrda by remember { mutableStateOf<String?>(null) }

    val serverGreska by auth.greska.collectAsState()
    val ucitava by auth.ucitava.collectAsState()

    // Ista pravila kao Angular validiraj(): ime obavezno, email regex, lozinka >=8, potvrda se poklapa.
    fun validiraj(): Boolean {
        greskaIme = if (ime.isBlank()) "Ime je obavezno" else null
        greskaEmail = when {
            email.isBlank() -> "Email je obavezan"
            !Regex("\\S+@\\S+\\.\\S+").matches(email) -> "Email nije ispravan"
            else -> null
        }
        greskaLozinka = when {
            lozinka.isEmpty() -> "Lozinka je obavezna"
            lozinka.length < 8 -> "Minimum 8 karaktera"
            else -> null
        }
        greskaPotvrda = when {
            potvrda.isEmpty() -> "Potvrdite lozinku"
            lozinka != potvrda -> "Lozinke se ne poklapaju"
            else -> null
        }
        return listOf(greskaIme, greskaEmail, greskaLozinka, greskaPotvrda).all { it == null }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("GLUMAC PLUS", style = MaterialTheme.typography.labelMedium)
        Text("Kreiraj nalog", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(24.dp))

        OutlinedTextField(
            value = ime,
            onValueChange = { ime = it; greskaIme = null },
            label = { Text("Ime") },
            singleLine = true,
            isError = greskaIme != null,
            supportingText = greskaIme?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; greskaEmail = null },
            label = { Text("Email") },
            singleLine = true,
            isError = greskaEmail != null,
            supportingText = greskaEmail?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = lozinka,
            onValueChange = { lozinka = it; greskaLozinka = null },
            label = { Text("Lozinka") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            isError = greskaLozinka != null,
            supportingText = greskaLozinka?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = potvrda,
            onValueChange = { potvrda = it; greskaPotvrda = null },
            label = { Text("Potvrdi lozinku") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            isError = greskaPotvrda != null,
            supportingText = greskaPotvrda?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth()
        )

        if (serverGreska != null) {
            Spacer(Modifier.height(8.dp))
            Text(serverGreska!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }

        Spacer(Modifier.height(20.dp))
        Button(
            onClick = { if (validiraj()) auth.register(ime, email, lozinka) { onIdiNaLogin() } },
            enabled = !ucitava,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (ucitava) "Kreiram nalog..." else "Kreiraj nalog")
        }

        TextButton(onClick = onIdiNaLogin, modifier = Modifier.fillMaxWidth()) {
            Text("Već imaš nalog? Prijavi se")
        }
    }
}
