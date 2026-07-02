package com.example.glumac_plus_android.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.glumac_plus_android.ui.auth.LoginScreen
import com.example.glumac_plus_android.ui.auth.RegisterScreen
import com.example.glumac_plus_android.viewmodel.AuthViewModel

// Rute — konstante da izbegnemo "magične stringove" (ekvivalent Angular path-eva).
object Ruta {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val MENI = "meni"
}

// NavHost = kontejner koji renderuje ekran za trenutnu rutu (ekvivalent Angular <router-outlet>).
// rememberNavController() = NavController koji preživljava recomposition (kao Router servis).
@Composable
fun AppNav(auth: AuthViewModel) {
    val nav = rememberNavController()
    val korisnik by auth.korisnik.collectAsState()

    // Reaguj na promenu auth stanja: čim se korisnik pojavi (login ili obnovljena sesija) -> meni;
    // na odjavu -> login. (Ekvivalent bi bio Angular guard/redirect.)
    LaunchedEffect(korisnik) {
        val ruta = nav.currentBackStackEntry?.destination?.route
        if (korisnik != null && ruta != Ruta.MENI) {
            nav.navigate(Ruta.MENI) { popUpTo(Ruta.LOGIN) { inclusive = true } }
        } else if (korisnik == null && ruta == Ruta.MENI) {
            nav.navigate(Ruta.LOGIN) { popUpTo(Ruta.MENI) { inclusive = true } }
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
                // Privremeni placeholder — pravi Meni ekran dolazi u sledećem koraku.
                MeniPlaceholder(ime = korisnik?.ime ?: "", onOdjava = { auth.logout() })
            }
        }
    }
}

@Composable
private fun MeniPlaceholder(ime: String, onOdjava: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Ulogovan kao", style = MaterialTheme.typography.labelMedium)
        Text(ime, style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(20.dp))
        Button(onClick = onOdjava) { Text("Odjavi se") }
    }
}
