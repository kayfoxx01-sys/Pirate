// ============================================================
// GÉNÉRATION DORÉE
// AUTHENTIFICATION DISCORD
// ============================================================

const API_URL = "http://147.135.213.131:20166";


// ============================================================
// OUTILS
// ============================================================

function escapeAuthHTML(text) {

    const div = document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML;

}


// ============================================================
// RÉCUPÉRER L'UTILISATEUR CONNECTÉ
// ============================================================

async function getCurrentUser() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        if (!response.ok) {

            return null;

        }

        const data =
            await response.json();

        if (!data.success) {

            return null;

        }

        return data.user || null;

    } catch (error) {

        console.error(
            "❌ Impossible de récupérer la session Discord :",
            error
        );

        return null;

    }

}


// ============================================================
// CONNEXION DISCORD
// ============================================================

function loginDiscord() {

    window.location.href =
        `${API_URL}/auth/discord`;

}


// ============================================================
// DÉCONNEXION
// ============================================================

async function logoutDiscord() {

    try {

        await fetch(
            `${API_URL}/api/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.error(
            "❌ Erreur déconnexion :",
            error
        );

    }

    window.location.reload();

}


// ============================================================
// AFFICHAGE DU PROFIL STAFF
// ============================================================

async function updateAuthInterface() {

    const status =
        document.getElementById(
            "staffStatus"
        );

    const loginButton =
        document.getElementById(
            "staffLogin"
        );

    const logoutButton =
        document.getElementById(
            "staffLogout"
        );

    const staffName =
        document.getElementById(
            "staffName"
        );

    const staffRole =
        document.getElementById(
            "staffRole"
        );

    const currentUser =
        await getCurrentUser();

    // --------------------------------------------------------
    // PAS CONNECTÉ
    // --------------------------------------------------------

    if (!currentUser) {

        if (status) {

            status.innerHTML = `

                <strong>
                    Non connecté
                </strong>

                <span>
                    Connecte-toi avec ton compte Discord.
                </span>

            `;

        }

        if (loginButton) {

            loginButton.style.display =
                "inline-flex";

        }

        if (logoutButton) {

            logoutButton.style.display =
                "none";

        }

        if (staffName) {

            staffName.textContent =
                "";

        }

        if (staffRole) {

            staffRole.textContent =
                "";

        }

        return null;

    }


    // --------------------------------------------------------
    // CONNECTÉ
    // --------------------------------------------------------

    if (status) {

        status.innerHTML = `

            <strong>

                ${escapeAuthHTML(
                    currentUser.username
                )}

            </strong>

            <span>

                ${escapeAuthHTML(
                    currentUser.roleName
                )}

            </span>

        `;

    }

    if (loginButton) {

        loginButton.style.display =
            "none";

    }

    if (logoutButton) {

        logoutButton.style.display =
            "inline-flex";

    }

    if (staffName) {

        staffName.textContent =
            currentUser.username;

    }

    if (staffRole) {

        staffRole.textContent =
            currentUser.roleName;

    }

    return currentUser;

}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🔐 Génération Dorée - Authentification Discord chargée."
        );

        await updateAuthInterface();

    }
);


// ============================================================
// EXPORT
// ============================================================

window.getCurrentUser =
    getCurrentUser;

window.loginDiscord =
    loginDiscord;

window.logoutDiscord =
    logoutDiscord;

window.updateAuthInterface =
    updateAuthInterface;