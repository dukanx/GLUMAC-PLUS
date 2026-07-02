package com.example.glumac_plus_android.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.glumac_plus_android.ui.auth.LoginScreen
import com.example.glumac_plus_android.ui.auth.RegisterScreen
import com.example.glumac_plus_android.ui.istorija.IstorijaScreen
import com.example.glumac_plus_android.ui.korpa.CartScreen
import com.example.glumac_plus_android.ui.meni.MeniScreen
import com.example.glumac_plus_android.ui.status.StatusScreen
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
fun AppNav(auth: AuthViewModel, cart: CartViewModel) {
    val nav = rememberNavController()
    val korisnik by auth.korisnik.collectAsState()

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

    Scaffold(modifier = Modifier.fillMaxSize()) { padding ->
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
                    onOtvoriKorpu = { nav.navigate(Ruta.KORPA) },
                    onOtvoriIstoriju = { nav.navigate(Ruta.ISTORIJA) },
                    onOdjava = { auth.logout() }
                )
            }
            composable(Ruta.KORPA) {
                CartScreen(
                    cart = cart,
                    auth = auth,
                    onNazad = { nav.popBackStack() },
                    onNaruceno = { id ->
                        // Posle naručivanja idi na Status (i skloni korpu sa back stack-a)
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
                StatusScreen(auth = auth, porudzbinaId = id, onZatvori = { nav.popBackStack() })
            }
        }
    }
}
