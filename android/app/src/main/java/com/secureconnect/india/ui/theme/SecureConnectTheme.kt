package com.secureconnect.india.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF4263EB),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDBE4FF),
    secondary = Color(0xFF5C7CFA),
    error = Color(0xFFEF4444),
    background = Color(0xFFFAFAFA),
    surface = Color.White,
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF748FFC),
    onPrimary = Color.White,
    primaryContainer = Color(0xFF1A237E),
    secondary = Color(0xFF91A7FF),
    error = Color(0xFFFF6B6B),
    background = Color(0xFF0A0A0A),
    surface = Color(0xFF1A1A1A),
)

@Composable
fun SecureConnectTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
