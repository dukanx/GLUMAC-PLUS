package com.example.glumac_plus_android.data.model

import kotlinx.serialization.Serializable

// Enum sa labelom — backend šalje/prima ime konstante ("U_LOKALU"),
// a `labela` je samo za prikaz u UI-ju (ekvivalent Angular TIP_LABELE mape).
@Serializable
enum class TipPorudzbine(val labela: String) {
    ZA_PONETI("Za poneti"),
    USPUT("Usput"),
    U_LOKALU("U lokalu")
}

@Serializable
enum class StatusPorudzbine {
    U_PRIPREMI, SPREMNA, REALIZOVANA, OTKAZANA
}

@Serializable
data class StavkaPorudzbine(
    val nazivProizvoda: String,
    val kolicina: Int,
    val cena: Double,
    val iznosStavke: Double
)

@Serializable
data class Porudzbina(
    val porudzbinaId: Long,
    val datum: String,
    val status: StatusPorudzbine,
    val ukupanIznos: Double,
    val originalnaCena: Double? = null,
    val napomena: String? = null,
    val tipPorudzbine: String? = null,
    val procenjenoVreme: Int? = null,
    val stavke: List<StavkaPorudzbine> = emptyList()
)

// Telo POST /api/porudzbine (kreiranje)
@Serializable
data class StavkaZahtev(
    val proizvodId: Long,
    val kolicina: Int
)

@Serializable
data class PorudzbinaRequest(
    val tipPorudzbine: TipPorudzbine,
    val napomena: String? = null,
    val stavke: List<StavkaZahtev>
)

// Paginiran odgovor (Spring Data Page) — generički, kao Angular PageResponse<T>
@Serializable
data class PageResponse<T>(
    val content: List<T> = emptyList(),
    val totalPages: Int = 0,
    val totalElements: Int = 0
)
