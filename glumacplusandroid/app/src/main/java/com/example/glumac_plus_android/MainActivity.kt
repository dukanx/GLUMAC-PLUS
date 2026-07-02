package com.example.glumac_plus_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.glumac_plus_android.ui.AppNav
import com.example.glumac_plus_android.ui.theme.GlumacplusandroidTheme
import com.example.glumac_plus_android.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GlumacplusandroidTheme {
                // Jedna instanca AuthViewModel-a za celu navigaciju (deli se između ekrana).
                val auth: AuthViewModel = viewModel()
                AppNav(auth)
            }
        }
    }
}
