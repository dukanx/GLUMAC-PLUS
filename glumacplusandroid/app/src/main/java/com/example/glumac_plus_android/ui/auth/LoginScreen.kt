package com.example.glumac_plus_android.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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

// @Composable = UI funkcija (ekvivalent React komponente / Angular template-a).
// Stanje polja drži `remember { mutableStateOf(...) }` (ekvivalent useState-a);
// reaktivno stanje iz ViewModel-a čita `collectAsState()` (ekvivalent async pipe-a).
@Composable
fun LoginScreen(auth: AuthViewModel, onIdiNaRegister: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var lozinka by remember { mutableStateOf("") }

    val greska by auth.greska.collectAsState()
    val ucitava by auth.ucitava.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("GLUMAC PLUS", style = MaterialTheme.typography.labelMedium)
        Text("Dobrodošli", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(24.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = lozinka,
            onValueChange = { lozinka = it },
            label = { Text("Lozinka") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        if (greska != null) {
            Spacer(Modifier.height(8.dp))
            Text(greska!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }

        Spacer(Modifier.height(20.dp))
        Button(
            onClick = { auth.login(email, lozinka) {} },   // onUspeh prazan — UI reaguje na promenu korisnik state-a
            enabled = !ucitava,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (ucitava) "Prijavljujem..." else "Prijavi se")
        }

        TextButton(onClick = onIdiNaRegister, modifier = Modifier.fillMaxWidth()) {
            Text("Nemaš nalog? Registruj se")
        }
    }
}
