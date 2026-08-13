// ============================================================
// GÉNÉRATION DORÉE
// AUTH STAFF LOCAL
// ============================================================

const STAFF_STORAGE_KEY = "generation_doree_staff_session";

const STAFF_USERS = [
    {
        username: "Priate",
        password: "Karma359@",
        role: "Fondateur"
    }

    // Ajoute d'autres personnes ici :
    //
    // {
    //     username: "username",
    //     password: "Change_Moi",
    //     role: "Staff"
    // }
];


// ============================================================
// SESSION
// ============================================================

function getCurrentUser() {

    try {

        const session =
            localStorage.getItem(
                STAFF_STORAGE_KEY
            );

        if (!session) {
            return null;
        }

        const user =
            JSON.parse(session);

        if (
            !user ||
            !user.username
        ) {
            return null;
        }

        return user;

    } catch {

        localStorage.removeItem(
            STAFF_STORAGE_KEY
        );

        return null;

    }

}


// ============================================================
// CONNEXION
// ============================================================

function loginStaff(username, password) {

    const user =
        STAFF_USERS.find(
            staff =>
                staff.username.toLowerCase() ===
                username.trim().toLowerCase() &&
                staff.password ===
                password
        );

    if (!user) {

        return {
            success: false,
            message:
                "Identifiant ou mot de passe incorrect."
        };

    }

    const session = {

        username:
            user.username,

        role:
            user.role

    };

    localStorage.setItem(
        STAFF_STORAGE_KEY,
        JSON.stringify(session)
    );

    return {
        success: true,
        user: session
    };

}


// ============================================================
// DÉCONNEXION
// ============================================================

function logoutStaff() {

    localStorage.removeItem(
        STAFF_STORAGE_KEY
    );

    window.location.reload();

}


// ============================================================
// INTERFACE
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

    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        if (status) {

            status.innerHTML = `
                <strong>Non connecté</strong>
                <span>
                    Connecte-toi avec ton compte Staff.
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

        return null;

    }


    if (status) {

        status.innerHTML = `

            <strong>
                🟢 ${escapeAuthHTML(
                    currentUser.username
                )}
            </strong>

            <span>
                ${escapeAuthHTML(
                    currentUser.role
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


    return currentUser;

}


// ============================================================
// PROTECTION HTML
// ============================================================

function escapeAuthHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateAuthInterface();

    }
);


// ============================================================
// EXPORT
// ============================================================

window.getCurrentUser =
    getCurrentUser;

window.loginStaff =
    loginStaff;

window.logoutStaff =
    logoutStaff;

window.updateAuthInterface =
    updateAuthInterface;