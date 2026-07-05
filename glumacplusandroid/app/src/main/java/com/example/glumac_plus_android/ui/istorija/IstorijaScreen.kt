package com.example.glumac_plus_android.ui.istorija

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
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.glumac_plus_android.data.model.Porudzbina
import com.example.glumac_plus_android.data.model.StatusPorudzbine
import com.example.glumac_plus_android.viewmodel.AuthViewModel
import com.example.glumac_plus_android.viewmodel.IstorijaViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IstorijaScreen(auth: AuthViewModel, onNazad: () -> Unit, onPrati: (Long) -> Unit) {
    val vm: IstorijaViewModel = viewModel()
    val token by auth.token.collectAsState()
    val porudzbine by vm.porudzbine.collectAsState()
    val ucitava by vm.ucitava.collectAsState()
    val greska by vm.greska.collectAsState()

    LaunchedEffect(token) { token?.let { vm.ucitaj("Bearer $it") } }

    Column(Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Porudžbine") },
            navigationIcon = {
                IconButton(onClick = onNazad) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Nazad")
                }
            }
        )

        when {
            ucitava -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            greska != null -> Text(
                greska!!,
                color = MaterialTheme.colorScheme.error,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(32.dp)
            )
            porudzbine.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Još nemaš porudžbina", style = MaterialTheme.typography.titleMedium)
            }
            else -> LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(porudzbine) { p ->
                    PorudzbinaKartica(
                        p = p,
                        onOtkazi = { token?.let { vm.otkazi("Bearer $it", p.porudzbinaId) } },
                        onPrati = { onPrati(p.porudzbinaId) }
                    )
                }
            }
        }
    }
}

@Composable
private fun PorudzbinaKartica(p: Porudzbina, onOtkazi: () -> Unit, onPrati: () -> Unit) {
    var razvijeno by remember { mutableStateOf(false) }

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("#${p.porudzbinaId}", style = MaterialTheme.typography.titleMedium)
                    Text(
                        formatirajDatum(p.datum),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(statusLabela(p.status), style = MaterialTheme.typography.labelMedium)
                    Text("${p.ukupanIznos.toInt()} RSD", style = MaterialTheme.typography.titleMedium)
                }
            }

            Spacer(Modifier.height(8.dp))
            TextButton(onClick = { razvijeno = !razvijeno }) {
                Icon(
                    if (razvijeno) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.size(4.dp))
                Text(if (razvijeno) "Sakrij stavke" else "Prikaži stavke (${p.stavke.size})")
            }

            if (razvijeno) {
                p.stavke.forEach { s ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("${s.kolicina.toInt()}× ${s.nazivProizvoda}", style = MaterialTheme.typography.bodyMedium)
                        Text("${s.iznosStavke.toInt()} RSD", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }

            val aktivna = p.status == StatusPorudzbine.U_PRIPREMI || p.status == StatusPorudzbine.SPREMNA
            if (aktivna) {
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onPrati) {
                        Icon(Icons.Filled.Visibility, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.size(6.dp))
                        Text("Prati")
                    }
                    if (p.status == StatusPorudzbine.U_PRIPREMI) {
                        OutlinedButton(onClick = onOtkazi) {
                            Icon(Icons.Filled.Cancel, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.size(6.dp))
                            Text("Otkaži")
                        }
                    }
                }
            }
        }
    }
}

private fun statusLabela(s: StatusPorudzbine): String = when (s) {
    StatusPorudzbine.U_PRIPREMI -> "U pripremi"
    StatusPorudzbine.SPREMNA -> "Spremna"
    StatusPorudzbine.REALIZOVANA -> "Realizovana"
    StatusPorudzbine.OTKAZANA -> "Otkazana"
}

private fun formatirajDatum(iso: String): String =
    if (iso.length >= 16) iso.take(16).replace('T', ' ') else iso
