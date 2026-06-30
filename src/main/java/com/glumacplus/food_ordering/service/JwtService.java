package com.glumacplus.food_ordering.service;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;

/**
 * Servis za generisanje i validaciju JWT tokena.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
public class JwtService {

    private final String secretKey;
    private final long expirationMs;

    /**
     * Kreira servis sa tajnim ključem i rokom važenja tokena iz konfiguracije.
     *
     * @param secretKey tajni ključ za potpisivanje tokena (Base64)
     * @param expirationMs rok važenja tokena u milisekundama
     */
    public JwtService(
            @Value("${app.jwt.secret}") String secretKey,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {
        this.secretKey = secretKey;
        this.expirationMs = expirationMs;
    }

    /**
     * Kreira ključ za potpisivanje na osnovu konfigurisanog tajnog ključa.
     *
     * @return ključ za potpisivanje
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generiše JWT token za zadatog korisnika, bez dodatnih klejmova.
     *
     * @param userDetails podaci o korisniku
     * @return generisani JWT token
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new java.util.HashMap<>(), userDetails);
    }

    /**
     * Generiše JWT token za zadatog korisnika sa dodatnim klejmovima.
     *
     * @param extraClaims dodatni klejmovi koji se ugrađuju u token
     * @param userDetails podaci o korisniku
     * @return generisani JWT token
     */
    public String generateToken(java.util.Map<String, Object> extraClaims, UserDetails userDetails) {
        return io.jsonwebtoken.Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new java.util.Date(System.currentTimeMillis()))
                .setExpiration(new java.util.Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSignInKey(), io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Izvlači korisničko ime iz tokena.
     *
     * @param token JWT token
     * @return korisničko ime iz tokena
     */
    public String extractUsername(String token) {
        return extractClaim(token, io.jsonwebtoken.Claims::getSubject);
    }

    /**
     * Izvlači određeni klejm iz tokena pomoću zadate funkcije.
     *
     * @param token JWT token
     * @param claimsResolver funkcija koja iz klejmova izvlači željenu vrednost
     * @param <T> tip vrednosti koja se izvlači
     * @return izvučena vrednost klejma
     */
    public <T> T extractClaim(String token, java.util.function.Function<io.jsonwebtoken.Claims, T> claimsResolver) {
        final io.jsonwebtoken.Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parsira token i vraća sve klejmove.
     *
     * @param token JWT token
     * @return svi klejmovi iz tokena
     */
    private io.jsonwebtoken.Claims extractAllClaims(String token) {
        return io.jsonwebtoken.Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Proverava da li je token validan za zadatog korisnika (poklapa se
     * korisničko ime i token nije istekao).
     *
     * @param token JWT token
     * @param userDetails podaci o korisniku
     * @return {@code true} ako je token validan, inače {@code false}
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Proverava da li je token istekao.
     *
     * @param token JWT token
     * @return {@code true} ako je token istekao, inače {@code false}
     */
    private boolean isTokenExpired(String token) {
        return extractClaim(token, io.jsonwebtoken.Claims::getExpiration).before(new java.util.Date());
    }
}
