package com.example.glumac_plus_android.ui.status

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.glumac_plus_android.data.model.StatusPorudzbine
import com.example.glumac_plus_android.viewmodel.AuthViewModel
import com.example.glumac_plus_android.viewmodel.StatusViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatusScreen(auth: AuthViewModel, porudzbinaId: Long, onZatvori: () -> Unit, onZavrseno: () -> Unit) {
    val vm: StatusViewModel = viewModel()
    val token by auth.token.collectAsState()
    val status by vm.status.collectAsState()
    val procenjeno by vm.procenjenoVreme.collectAsState()
    val greska by vm.greska.collectAsState()

    LaunchedEffect(porudzbinaId, token) {
        token?.let { vm.pokreni("Bearer $it", porudzbinaId) }
    }

    val zavrseno = status == StatusPorudzbine.REALIZOVANA || status == StatusPorudzbine.OTKAZANA
    LaunchedEffect(zavrseno) { if (zavrseno) onZavrseno() }

    Column(Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Porudžbina #$porudzbinaId") },
            navigationIcon = {
                IconButton(onClick = onZatvori) {
                    Icon(Icons.Filled.Close, contentDescription = "Zatvori")
                }
            }
        )

        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                if (zavrseno) "Završeno" else "Pratimo status...",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(28.dp))

            if (status == StatusPorudzbine.OTKAZANA) {
                Text(
                    "Porudžbina je otkazana",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.error
                )
            } else {
                StatusKoraci(aktivni = aktivniIndex(status))
                Spacer(Modifier.height(24.dp))
                Text(
                    porukaZa(status, procenjeno),
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center
                )
            }

            if (greska) {
                Spacer(Modifier.height(12.dp))
                Text(
                    "Problem sa konekcijom. Status možda nije ažuran.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

            Spacer(Modifier.height(28.dp))
            if (zavrseno) {
                Button(onClick = onZatvori, modifier = Modifier.fillMaxWidth()) { Text("Zatvori") }
            } else {
                TextButton(onClick = onZatvori) { Text("Zatvori") }
            }
        }
    }
}

@Composable
private fun StatusKoraci(aktivni: Int) {
    val koraci = listOf("Primljeno", "U pripremi", "Gotovo")
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        koraci.forEachIndexed { i, labela ->
            val proslo = i <= aktivni
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                KorakKrug(proslo = proslo, broj = i + 1)
                Spacer(Modifier.height(6.dp))
                Text(
                    labela,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (proslo) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun KorakKrug(proslo: Boolean, broj: Int) {
    Box(
        modifier = Modifier
            .size(44.dp)
            .clip(CircleShape)
            .background(if (proslo) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant),
        contentAlignment = Alignment.Center
    ) {
        Text(
            "$broj",
            color = if (proslo) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.titleMedium
        )
    }
}

private fun aktivniIndex(s: StatusPorudzbine?): Int = when (s) {
    StatusPorudzbine.U_PRIPREMI -> 0
    StatusPorudzbine.SPREMNA -> 1
    StatusPorudzbine.REALIZOVANA -> 2
    else -> -1
}

private fun porukaZa(s: StatusPorudzbine?, procenjeno: Int?): String = when (s) {
    StatusPorudzbine.U_PRIPREMI -> "Vaša porudžbina je primljena! Čekamo potvrdu kuhinje..."
    StatusPorudzbine.SPREMNA ->
        if (procenjeno != null) "Prihvaćena — procenjeno vreme čekanja je $procenjeno minuta."
        else "Palačinke se prave! Uskoro su gotove."
    StatusPorudzbine.REALIZOVANA -> "Gotovo! Dođite po svoju porudžbinu na kasu."
    else -> ""
}
