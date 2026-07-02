package com.example.glumac_plus_android.data.model

import kotlinx.serialization.Serializable

// @Serializable = kotlinx-serialization sme automatski iz/u JSON (backend odgovor <-> objekat).
// data class = klasa koja samo nosi podatke (auto equals/copy/toString) — ekvivalent TS interface-a.

@Serializable
data class Korisnik(
    val id: Long,
    val ime: String,
    val email: String,
    val uloga: String? = null,
    val brojBodova: Double = 0.0,
    val loyaltyNivo: String? = null
)

@Serializable
data class LoyaltyProgram(
    val id: Long,
    val nivo: String,
    val popust: Double,
    val pragBodova: Int
)

// Telo POST /api/auth/login
@Serializable
data class LoginRequest(
    val email: String,
    val lozinka: String
)

// Odgovor login-a: token + korisnik
@Serializable
data class LoginResponse(
    val token: String,
    val korisnik: Korisnik
)

// Telo POST /api/korisnici (registracija)
@Serializable
data class RegisterRequest(
    val ime: String,
    val email: String,
    val lozinka: String
)
