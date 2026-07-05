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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.glumac_plus_android.data.model.Proizvod
import com.example.glumac_plus_android.viewmodel.AuthViewModel
import com.example.glumac_plus_android.viewmodel.CartViewModel
import com.example.glumac_plus_android.viewmodel.MeniViewModel
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MeniScreen(
    cart: CartViewModel,
    auth: AuthViewModel,
    onOtvoriIstoriju: () -> Unit,
    onOdjava: () -> Unit
) {
    val vm: MeniViewModel = viewModel()
    val proizvodi by vm.proizvodi.collectAsState()
    val ucitava by vm.ucitava.collectAsState()
    val greska by vm.greska.collectAsState()
    val korpa by cart.korpa.collectAsState()
    val korisnik by auth.korisnik.collectAsState()
    val popust by auth.popust.collectAsState()

    Column(Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Meni") },
            actions = {
                IconButton(onClick = onOtvoriIstoriju) {
                    Icon(Icons.Filled.ReceiptLong, contentDescription = "Porudžbine")
                }
                IconButton(onClick = onOdjava) {
                    Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Odjava")
                }
            }
        )

        // Loyalty baner — prikaži kad korisnik ima popust (kao Angular)
        if (popust > 0) {
            Surface(color = MaterialTheme.colorScheme.secondaryContainer) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Filled.Star, contentDescription = null, modifier = Modifier.size(16.dp))
                    Text(
                        "${korisnik?.loyaltyNivo ?: ""} — popust: ${popust.toInt()}%",
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            }
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
                items(proizvodi) { p ->
                    ProizvodKartica(
                        p = p,
                        popust = popust,
                        kolicina = korpa.find { it.proizvod.id == p.id }?.kolicina ?: 0,
                        onDodaj = { cart.dodaj(p) },
                        onPovecaj = { cart.povecaj(p.id) },
                        onSmanji = { cart.smanji(p.id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun ProizvodKartica(
    p: Proizvod,
    popust: Double,
    kolicina: Int,
    onDodaj: () -> Unit,
    onPovecaj: () -> Unit,
    onSmanji: () -> Unit
) {
    val cena = p.cena.toInt()
    val cenaSaPopustom = if (popust > 0) (p.cena * (1 - popust / 100)).roundToInt() else null

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
            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Cena — sa popustom prikaži precrtanu original + umanjenu
                if (cenaSaPopustom != null) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            "$cena",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textDecoration = TextDecoration.LineThrough
                        )
                        Text("$cenaSaPopustom RSD", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                    }
                } else {
                    Text("$cena RSD", style = MaterialTheme.typography.titleMedium)
                }

                if (kolicina == 0) {
                    Button(onClick = onDodaj) {
                        Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.size(6.dp))
                        Text("Dodaj")
                    }
                } else {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilledTonalIconButton(onClick = onSmanji) {
                            Icon(Icons.Filled.Remove, contentDescription = "Manje")
                        }
                        Text("$kolicina", style = MaterialTheme.typography.titleMedium)
                        FilledTonalIconButton(onClick = onPovecaj) {
                            Icon(Icons.Filled.Add, contentDescription = "Više")
                        }
                    }
                }
            }
        }
    }
}
