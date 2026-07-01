package com.example.glumac_plus_android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Proizvod(
    val id: Long,
    val naziv: String,
    val opis: String? = null,
    val cena: Double,                 
    val tip: String,
    val alergeniNazivi: List<String>? = null
)

data class StavkaKorpe(
    val proizvod: Proizvod,
    val kolicina: Int
)
