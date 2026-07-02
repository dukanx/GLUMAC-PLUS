package com.example.glumac_plus_android.ui.korpa

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.glumac_plus_android.data.model.StavkaKorpe
import com.example.glumac_plus_android.data.model.TipPorudzbine
import com.example.glumac_plus_android.viewmodel.AuthViewModel
import com.example.glumac_plus_android.viewmodel.CartViewModel

@Composable
fun CartScreen(cart: CartViewModel, auth: AuthViewModel, onNazad: () -> Unit, onNaruceno: (Long) -> Unit) {
    val korpa by cart.korpa.collectAsState()
    val token by auth.token.collectAsState()
    val porucivanje by cart.porucivanje.collectAsState()
    val greska by cart.greskaPorudzbine.collectAsState()

    var tip by remember { mutableStateOf(TipPorudzbine.U_LOKALU) }
    var napomena by remember { mutableStateOf("") }

    Column(Modifier.fillMaxSize()) {

        // Zaglavlje — nazad + naslov
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onNazad) { Text("← Nazad") }
            Text("Korpa", style = MaterialTheme.typography.headlineMedium)
        }

        if (korpa.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Korpa je prazna", style = MaterialTheme.typography.titleMedium)
            }
            return@Column
        }

        // Lista stavki (zauzima preostali prostor)
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(korpa) { s ->
                StavkaRed(
                    s = s,
                    onPovecaj = { cart.povecaj(s.proizvod.id) },
                    onSmanji = { cart.smanji(s.proizvod.id) },
                    onUkloni = { cart.ukloni(s.proizvod.id) }
                )
            }
        }

        // Podnožje — tip, napomena, ukupno, naruči
        Column(Modifier.padding(16.dp)) {
            Text("Tip porudžbine", style = MaterialTheme.typography.labelMedium)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TipPorudzbine.entries.forEach { t ->
                    if (t == tip) {
                        Button(onClick = { tip = t }) { Text(t.labela) }
                    } else {
                        OutlinedButton(onClick = { tip = t }) { Text(t.labela) }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = napomena,
                onValueChange = { napomena = it },
                label = { Text("Napomena (opciono)") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Ukupno", style = MaterialTheme.typography.titleMedium)
                Text("${cart.ukupnaCena} RSD", style = MaterialTheme.typography.titleMedium)
            }

            if (greska != null) {
                Spacer(Modifier.height(8.dp))
                Text(greska!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }

            Spacer(Modifier.height(12.dp))
            Button(
                onClick = { token?.let { t -> cart.naruci("Bearer $t", tip, napomena) { id -> onNaruceno(id) } } },
                enabled = !porucivanje,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (porucivanje) "Šaljem..." else "Naruči")
            }
        }
    }
}

@Composable
private fun StavkaRed(s: StavkaKorpe, onPovecaj: () -> Unit, onSmanji: () -> Unit, onUkloni: () -> Unit) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(s.proizvod.naziv, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                TextButton(onClick = onUkloni) { Text("Ukloni") }
            }
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    FilledTonalButton(onClick = onSmanji) { Text("−") }
                    Text("${s.kolicina}", style = MaterialTheme.typography.titleMedium)
                    FilledTonalButton(onClick = onPovecaj) { Text("+") }
                }
                Text("${(s.proizvod.cena * s.kolicina).toInt()} RSD", style = MaterialTheme.typography.titleSmall)
            }
        }
    }
}
