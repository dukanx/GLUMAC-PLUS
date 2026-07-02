package com.example.glumac_plus_android.ui.meni

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
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.glumac_plus_android.data.model.Proizvod
import com.example.glumac_plus_android.viewmodel.MeniViewModel

@Composable
fun MeniScreen(onOdjava: () -> Unit) {
    val vm: MeniViewModel = viewModel()
    val proizvodi by vm.proizvodi.collectAsState()
    val ucitava by vm.ucitava.collectAsState()
    val greska by vm.greska.collectAsState()

    Column(Modifier.fillMaxSize()) {

        // Zaglavlje — naslov + odjava (privremeno; navbar/loyalty dolaze kasnije)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Meni", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.weight(1f))
            TextButton(onClick = onOdjava) { Text("Odjavi se") }
        }

        when {
            ucitava -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            greska != null -> Text(
                text = greska!!,
                color = MaterialTheme.colorScheme.error,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(32.dp)
            )
            else -> LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // items() = renderuj po stavci (ekvivalent *ngFor); lazy = samo vidljive u DOM-u
                items(proizvodi) { p -> ProizvodKartica(p) }
            }
        }
    }
}

@Composable
private fun ProizvodKartica(p: Proizvod) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Text(p.naziv, style = MaterialTheme.typography.titleMedium)
            if (!p.opis.isNullOrBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(
                    p.opis,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(Modifier.height(8.dp))
            Text("${p.cena.toInt()} RSD", style = MaterialTheme.typography.titleSmall)
        }
    }
}
