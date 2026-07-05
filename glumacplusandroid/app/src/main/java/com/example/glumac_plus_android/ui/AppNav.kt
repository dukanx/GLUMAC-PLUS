package com.example.glumac_plus_android.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.glumac_plus_android.ui.auth.LoginScreen
import com.example.glumac_plus_android.ui.auth.RegisterScreen
import com.example.glumac_plus_android.ui.istorija.IstorijaScreen
import com.example.glumac_plus_android.ui.korpa.CartScreen
import com.example.glumac_plus_android.ui.meni.MeniScreen
import com.example.glumac_plus_android.ui.status.StatusScreen
import com.example.glumac_plus_android.viewmodel.AktivnaPorudzbinaViewModel
import com.example.glumac_plus_android.viewmodel.AuthViewModel
import com.example.glumac_plus_android.viewmodel.CartViewModel

// Rute — konstante da izbegnemo "magične stringove" (ekvivalent Angular path-eva).
object Ruta {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val MENI = "meni"
    const val KORPA = "korpa"
    const val ISTORIJA = "istorija"
    // Ruta sa argumentom — id porudžbine se prosleđuje u putanji (Navigation Compose argument)
    const val STATUS_ARG = "porudzbinaId"
    const val STATUS_PATTERN = "status/{$STATUS_ARG}"
    fun status(id: Long) = "status/$id"
}

// NavHost = kontejner koji renderuje ekran za trenutnu rutu (ekvivalent Angular <router-outlet>).
// rememberNavController() = NavController koji preživljava recomposition (kao Router servis).
@Composable
fun AppNav(auth: AuthViewModel, cart: CartViewModel, aktivna: AktivnaPorudzbinaViewModel) {
    val nav = rememberNavController()
    val korisnik by auth.korisnik.collectAsState()
    val korpa by cart.korpa.collectAsState()
    val aktivnaId by aktivna.aktivnaId.collectAsState()

    // Trenutna ruta — da znamo na kojim ekranima da prikažemo FloatingBubble
    val backEntry by nav.currentBackStackEntryAsState()
    val trenutnaRuta = backEntry?.destination?.route

    // Reaguj na promenu auth stanja: čim se korisnik pojavi (login ili obnovljena sesija) -> meni;
    // na odjavu -> login. (Ekvivalent bi bio Angular guard/redirect.)
    LaunchedEffect(korisnik) {
        val ruta = nav.currentBackStackEntry?.destination?.route
        if (korisnik != null && ruta != Ruta.MENI) {
            nav.navigate(Ruta.MENI) { popUpTo(Ruta.LOGIN) { inclusive = true } }
        } else if (korisnik == null && ruta != null && ruta != Ruta.LOGIN && ruta != Ruta.REGISTER) {
            // Odjava sa bilo kog zaštićenog ekrana -> login (očisti back stack)
            nav.navigate(Ruta.LOGIN) { popUpTo(0) { inclusive = true } }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        floatingActionButton = {
            // Prikaži bubble samo na Meni/Istorija (na korpi/statusu je suvišan)
            if (trenutnaRuta == Ruta.MENI || trenutnaRuta == Ruta.ISTORIJA) {
                FloatingBubble(
                    aktivnaId = aktivnaId,
                    brojStavki = korpa.sumOf { it.kolicina },
                    onPrati = { id -> nav.navigate(Ruta.status(id)) },
                    onKorpa = { nav.navigate(Ruta.KORPA) }
                )
            }
        }
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Ruta.LOGIN,
            modifier = Modifier.padding(padding)
        ) {
            composable(Ruta.LOGIN) {
                LoginScreen(auth, onIdiNaRegister = { nav.navigate(Ruta.REGISTER) })
            }
            composable(Ruta.REGISTER) {
                RegisterScreen(auth, onIdiNaLogin = { nav.popBackStack() })
            }
            composable(Ruta.MENI) {
                MeniScreen(
                    cart = cart,
                    auth = auth,
                    onOtvoriIstoriju = { nav.navigate(Ruta.ISTORIJA) },
                    onOdjava = { auth.logout(); aktivna.ocisti() }
                )
            }
            composable(Ruta.KORPA) {
                CartScreen(
                    cart = cart,
                    auth = auth,
                    onNazad = { nav.popBackStack() },
                    onNaruceno = { id ->
                        // Zabeleži aktivnu porudžbinu (za FloatingBubble) i idi na Status
                        aktivna.postavi(id)
                        nav.navigate(Ruta.status(id)) { popUpTo(Ruta.KORPA) { inclusive = true } }
                    }
                )
            }
            composable(Ruta.ISTORIJA) {
                IstorijaScreen(
                    auth = auth,
                    onNazad = { nav.popBackStack() },
                    onPrati = { id -> nav.navigate(Ruta.status(id)) }
                )
            }
            composable(
                route = Ruta.STATUS_PATTERN,
                arguments = listOf(navArgument(Ruta.STATUS_ARG) { type = NavType.LongType })
            ) { entry ->
                val id = entry.arguments?.getLong(Ruta.STATUS_ARG) ?: 0L
                StatusScreen(
                    auth = auth,
                    porudzbinaId = id,
                    onZatvori = { nav.popBackStack() },
                    onZavrseno = { aktivna.ocisti() }
                )
            }
        }
    }
}

// FloatingBubble — globalni brzi pristup (ekvivalent Angular FloatingBubble):
// ako postoji aktivna porudžbina -> "Prati porudžbinu"; inače ako ima stavki -> "Korpa · N".
@Composable
private fun FloatingBubble(
    aktivnaId: Long?,
    brojStavki: Int,
    onPrati: (Long) -> Unit,
    onKorpa: () -> Unit
) {
    when {
        aktivnaId != null -> ExtendedFloatingActionButton(
            onClick = { onPrati(aktivnaId) },
            icon = { Icon(Icons.Filled.Restaurant, contentDescription = null) },
            text = { Text("Prati porudžbinu") }
        )
        brojStavki > 0 -> ExtendedFloatingActionButton(
            onClick = onKorpa,
            icon = { Icon(Icons.Filled.ShoppingCart, contentDescription = null) },
            text = { Text("Korpa · $brojStavki") }
        )
    }
}
