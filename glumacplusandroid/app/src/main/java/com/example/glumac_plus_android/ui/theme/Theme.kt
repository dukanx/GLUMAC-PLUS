package com.example.glumac_plus_android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Fiksna "Calm Editorial" tema (bez dynamic color) da brend paleta bude dosledna na svim uređajima.
private val CalmColors = lightColorScheme(
    primary = Rust,
    onPrimary = PaperOnRust,
    secondary = Ink,
    onSecondary = Paper,
    secondaryContainer = Paper2,
    onSecondaryContainer = Ink,
    background = Paper,
    onBackground = Ink,
    surface = Paper,
    onSurface = Ink,
    surfaceVariant = Paper2,
    onSurfaceVariant = InkMuted,
    // Tople bež nijanse za kontejnere (kartice, TopAppBar) umesto default sivih
    surfaceContainerLowest = Color(0xFFFFFBF2),
    surfaceContainerLow = PaperCard,
    surfaceContainer = Color(0xFFF1EAD9),
    surfaceContainerHigh = PaperCardHigh,
    surfaceContainerHighest = Color(0xFFE7DDC8),
    outline = InkMuted,
    outlineVariant = Color(0xFFD8CDBA),
    error = GreskaRed,
    onError = Color.White,
)

@Composable
fun GlumacplusandroidTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = CalmColors,
        typography = Typography,
        content = content
    )
}
