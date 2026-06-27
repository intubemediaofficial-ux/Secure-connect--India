package com.secureconnect.india.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.secureconnect.india.ui.auth.LoginScreen
import com.secureconnect.india.ui.emergency.SOSScreen

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Dashboard : Screen("dashboard")
    data object Emergency : Screen("emergency")
    data object Consultation : Screen("consultation")
    data object Wallet : Screen("wallet")
    data object Profile : Screen("profile")
    data object Chat : Screen("chat/{consultationId}")
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Emergency.route) {
            SOSScreen()
        }

        // TODO: Add more screens
    }
}
