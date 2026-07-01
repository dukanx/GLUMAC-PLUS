package com.example.glumac_plus_android.data.remote

import com.example.glumac_plus_android.data.model.Korisnik
import com.example.glumac_plus_android.data.model.LoginRequest
import com.example.glumac_plus_android.data.model.LoginResponse
import com.example.glumac_plus_android.data.model.LoyaltyProgram
import com.example.glumac_plus_android.data.model.PageResponse
import com.example.glumac_plus_android.data.model.Porudzbina
import com.example.glumac_plus_android.data.model.PorudzbinaRequest
import com.example.glumac_plus_android.data.model.Proizvod
import com.example.glumac_plus_android.data.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

// Retrofit interfejs — deklarativan opis REST endpointa (ekvivalent Angular servisnih metoda).
// `suspend` = poziva se iz coroutine (asinhrono, bez blokiranja UI niti).
// Retrofit sam generiše implementaciju; @Serializable modeli se auto-parsiraju iz/u JSON.
interface ApiService {

    // ── Auth ──
    @POST("api/auth/login")
    suspend fun login(@Body telo: LoginRequest): LoginResponse

    @POST("api/korisnici")
    suspend fun register(@Body telo: RegisterRequest): Korisnik

    @GET("api/korisnici/me")
    suspend fun me(@Header("Authorization") auth: String): Korisnik

    // ── Loyalty (javno) ──
    @GET("api/loyalty_program")
    suspend fun loyaltyProgrami(): List<LoyaltyProgram>

    // ── Proizvodi (javno) ──
    @GET("api/proizvodi")
    suspend fun proizvodi(): List<Proizvod>

    @GET("api/proizvodi/{id}")
    suspend fun proizvod(@Path("id") id: Long): Proizvod

    // ── Porudžbine (zaštićeno — traži Bearer token) ──
    @POST("api/porudzbine")
    suspend fun kreirajPorudzbinu(
        @Header("Authorization") auth: String,
        @Body telo: PorudzbinaRequest
    ): Porudzbina

    @GET("api/porudzbine/{id}")
    suspend fun porudzbina(
        @Header("Authorization") auth: String,
        @Path("id") id: Long
    ): Porudzbina

    @GET("api/porudzbine/moje")
    suspend fun mojePorudzbine(
        @Header("Authorization") auth: String,
        @Query("page") page: Int,
        @Query("size") size: Int
    ): PageResponse<Porudzbina>

    @POST("api/porudzbine/{id}/otkazi")
    suspend fun otkaziPorudzbinu(
        @Header("Authorization") auth: String,
        @Path("id") id: Long
    ): Response<Unit>
}
