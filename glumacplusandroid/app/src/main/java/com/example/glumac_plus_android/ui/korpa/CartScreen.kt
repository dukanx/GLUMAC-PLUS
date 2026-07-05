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
    import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
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
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(cart: CartViewModel, auth: AuthViewModel, onNazad: () -> Unit, onNaruceno: (Long) -> Unit) {
    val korpa by cart.korpa.collectAsState()
    val token by auth.token.collectAsState()
    val porucivanje by cart.porucivanje.collectAsState()
    val greska by cart.greskaPorudzbine.collectAsState()
    val popust by auth.popust.collectAsState()

    var tip by remember { mutableStateOf(TipPorudzbine.U_LOKALU) }
    var napomena by remember { mutableStateOf("") }

    // Zaokruživanje finalne cene, isto pravilo kao Angular/backend: round(ukupno * (1 - popust/100))
    val ukupno = cart.ukupnaCena
    val zaPlacanje = if (popust > 0) (ukupno * (1 - popust / 100)).roundToInt() else ukupno

    Column(Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Korpa") },
            navigationIcon = {
                IconButton(onClick = onNazad) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Nazad")
                }
            }
        )

        if (korpa.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Korpa je prazna", style = MaterialTheme.typography.titleMedium)
            }
            return@Column
        }

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

        Column(Modifier.padding(16.dp)) {
            Text("Tip porudžbine", style = MaterialTheme.typography.labelMedium)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TipPorudzbine.entries.forEach { t ->
                    if (t == tip) Button(onClick = { tip = t }) { Text(t.labela) }
                    else OutlinedButton(onClick = { tip = t }) { Text(t.labela) }
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
            if (popust > 0) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Loyalty popust (${popust.toInt()}%)", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("−${ukupno - zaPlacanje} RSD", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                }
                Spacer(Modifier.height(4.dp))
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Ukupno", style = MaterialTheme.typography.titleMedium)
                Text("$zaPlacanje RSD", style = MaterialTheme.typography.titleMedium)
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
                Icon(Icons.Filled.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.size(6.dp))
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
                IconButton(onClick = onUkloni) {
                    Icon(Icons.Filled.Delete, contentDescription = "Ukloni", tint = MaterialTheme.colorScheme.error)
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilledTonalIconButton(onClick = onSmanji) { Icon(Icons.Filled.Remove, contentDescription = "Manje") }
                    Text("${s.kolicina}", style = MaterialTheme.typography.titleMedium)
                    FilledTonalIconButton(onClick = onPovecaj) { Icon(Icons.Filled.Add, contentDescription = "Više") }
                }
                Text("${(s.proizvod.cena * s.kolicina).toInt()} RSD", style = MaterialTheme.typography.titleSmall)
            }
        }
    }
}
