package com.example.glumac_plus_android.data.remote

import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

// Jedno mesto koje sastavlja Retrofit klijenta i daje gotov ApiService.
// `object` = singleton (jedna instanca u celoj aplikaciji) — sličan ulozi Angular providedIn:'root'.
object ApiClient {

    // Emulator ne vidi "localhost" host mašine — koristi 10.0.2.2. Mora završiti sa "/".
    private const val BASE_URL = "http://10.0.2.2:8080/"

    // ignoreUnknownKeys = backend šalje i polja koja NE modelujemo → ne pucaj, samo ih preskoči.
    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    // Loguje HTTP zahteve/odgovore u Logcat (korisno za debug; isključiti u produkciji).
    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttp = OkHttpClient.Builder()
        .addInterceptor(logging)
        .build()

    // by lazy = kreira se tek pri prvom pristupu (i onda kešira).
    val service: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttp)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(ApiService::class.java)
    }
}
