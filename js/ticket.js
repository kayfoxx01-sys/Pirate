// ============================================================
// GÉNÉRATION DORÉE
// SYSTÈME DE TICKETS
// ============================================================

const TICKETS_KEY = "generation_doree_tickets";
const STAFF_KEY = "generation_doree_staff";
const CURRENT_STAFF_KEY = "generation_doree_current_staff";


// ============================================================
// OUTILS
// ============================================================

function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).substring(2, 10)
    );

}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML;

}


function getTickets() {

    try {

        const data =
            localStorage.getItem(TICKETS_KEY);

        if (!data) {
            return [];
        }

        const tickets =
            JSON.parse(data);

        return Array.isArray(tickets)
            ? tickets
            : [];

    } catch (error) {

        console.error(
            "Erreur récupération tickets :",
            error
        );

        return [];

    }

}


function saveTickets(tickets) {

    try {

        localStorage.setItem(
            TICKETS_KEY,
            JSON.stringify(tickets)
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur sauvegarde tickets :",
            error
        );

        return false;

    }

}


function getStaff() {

    try {

        const data =
            localStorage.getItem(STAFF_KEY);

        if (!data) {
            return [];
        }

        const staff =
            JSON.parse(data);

        return Array.isArray(staff)
            ? staff
            : [];

    } catch (error) {

        console.error(
            "Erreur récupération staff :",
            error
        );

        return [];

    }

}


function saveStaff(staff) {

    try {

        localStorage.setItem(
            STAFF_KEY,
            JSON.stringify(staff)
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur sauvegarde staff :",
            error
        );

        return false;

    }

}


function getCurrentStaff() {

    try {

        const data =
            localStorage.getItem(
                CURRENT_STAFF_KEY
            );

        if (!data) {
            return null;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Erreur récupération staff connecté :",
            error
        );

        return null;

    }

}


function setCurrentStaff(staff) {

    localStorage.setItem(
        CURRENT_STAFF_KEY,
        JSON.stringify(staff)
    );

}


function clearCurrentStaff() {

    localStorage.removeItem(
        CURRENT_STAFF_KEY
    );

}


// ============================================================
// RÔLES STAFF
// ============================================================

function getRoleName(role) {

    switch (role) {

        case "moderator":
            return "🛡️ Modérateur";

        case "admin":
            return "🔧 Administrateur";

        case "founder":
            return "👑 Fondateur";

        default:
            return "👤 Membre Staff";

    }

}


function roleLevel(role) {

    switch (role) {

        case "moderator":
            return 1;

        case "admin":
            return 2;

        case "founder":
            return 3;

        default:
            return 0;

    }

}


// ============================================================
// INITIALISATION STAFF
// ============================================================

function initializeStaff() {

    const staff =
        getStaff();

    if (staff.length > 0) {
        return;
    }

    const founder = {

        id: generateId(),

        name: "FONDATEUR",

        role: "founder",

        createdAt:
            new Date().toISOString()

    };

    staff.push(founder);

    saveStaff(staff);

    console.log(
        "👑 Premier fondateur créé : FONDATEUR"
    );

}


// ============================================================
// CRÉATION D'UN TICKET
// ============================================================

function initializeTicketForm() {

    const form =
        document.getElementById(
            "ticketForm"
        );

    if (!form) {
        return;
    }

    // Évite de créer plusieurs listeners
    if (form.dataset.ticketInitialized === "true") {
        return;
    }

    form.dataset.ticketInitialized = "true";

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const nameInput =
                document.getElementById(
                    "ticketName"
                );

            const subjectInput =
                document.getElementById(
                    "ticketSubject"
                );

            const messageInput =
                document.getElementById(
                    "ticketMessage"
                );

            if (
                !nameInput ||
                !subjectInput ||
                !messageInput
            ) {

                console.error(
                    "❌ Champs du formulaire ticket introuvables."
                );

                return;

            }

            const name =
                nameInput.value.trim();

            const subject =
                subjectInput.value.trim();

            const message =
                messageInput.value.trim();

            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!name) {

                showTicketMessage(
                    "❌ Entre ton nom Discord.",
                    "error"
                );

                return;

            }

            if (!subject) {

                showTicketMessage(
                    "❌ Entre le sujet du ticket.",
                    "error"
                );

                return;

            }

            if (!message) {

                showTicketMessage(
                    "❌ Explique ton problème.",
                    "error"
                );

                return;

            }

            if (name.length > 100) {

                showTicketMessage(
                    "❌ Nom Discord trop long.",
                    "error"
                );

                return;

            }

            if (subject.length > 200) {

                showTicketMessage(
                    "❌ Sujet trop long.",
                    "error"
                );

                return;

            }

            if (message.length > 3000) {

                showTicketMessage(
                    "❌ Message trop long.",
                    "error"
                );

                return;

            }

            // ------------------------------------------------
            // RÉCUPÉRATION TICKETS
            // ------------------------------------------------

            const tickets =
                getTickets();

            // ------------------------------------------------
            // VÉRIFICATION TICKET DÉJÀ OUVERT
            // ------------------------------------------------

            const existingTicket =
                tickets.find(
                    ticket =>

                        ticket.discordName &&
                        ticket.discordName
                            .toLowerCase() ===
                            name.toLowerCase() &&

                        ticket.status === "open"
                );

            if (existingTicket) {

                showTicketMessage(
                    "⚠️ Tu as déjà un ticket ouvert.",
                    "error"
                );

                return;

            }

            // ------------------------------------------------
            // CRÉATION
            // ------------------------------------------------

            const now =
                new Date().toISOString();

            const ticket = {

                id:
                    generateId(),

                discordName:
                    name,

                subject:
                    subject,

                status:
                    "open",

                createdAt:
                    now,

                updatedAt:
                    now,

                closedAt:
                    null,

                closedBy:
                    null,

                messages: [

                    {

                        id:
                            generateId(),

                        author:
                            name,

                        message:
                            message,

                        staff:
                            false,

                        role:
                            null,

                        date:
                            now

                    }

                ]

            };

            tickets.push(ticket);

            const saved =
                saveTickets(tickets);

            if (!saved) {

                showTicketMessage(
                    "❌ Impossible d'enregistrer le ticket.",
                    "error"
                );

                return;

            }

            // ------------------------------------------------
            // RESET
            // ------------------------------------------------

            form.reset();

            showTicketMessage(
                `✅ Ticket créé avec succès ! Numéro : ${ticket.id}`,
                "success"
            );

            console.log(
                "🎫 Nouveau ticket :",
                ticket
            );

            // Actualisation interface staff
            renderTicketsList();

        }
    );

}


// ============================================================
// MESSAGE FORMULAIRE
// ============================================================

function showTicketMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "ticketMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `ticket-message ${type}`;

}


// ============================================================
// AFFICHAGE DES TICKETS STAFF
// ============================================================

function renderTicketsList() {

    const container =
        document.getElementById(
            "ticketsList"
        );

    if (!container) {
        return;
    }

    const currentStaff =
        getCurrentStaff();

    // --------------------------------------------------------
    // PAS CONNECTÉ
    // --------------------------------------------------------

    if (!currentStaff) {

        container.innerHTML = `

            <div class="empty-tickets">

                🔒 Connecte-toi en tant que Staff
                pour voir les tickets.

            </div>

        `;

        return;

    }

    // --------------------------------------------------------
    // RÉCUPÉRATION
    // --------------------------------------------------------

    const tickets =
        getTickets();

    const openTickets =
        tickets.filter(
            ticket =>
                ticket.status === "open"
        );

    // --------------------------------------------------------
    // AUCUN TICKET
    // --------------------------------------------------------

    if (!openTickets.length) {

        container.innerHTML = `

            <div class="empty-tickets">

                📭 Aucun ticket ouvert actuellement.

            </div>

        `;

        return;

    }

    // --------------------------------------------------------
    // TRI : PLUS RÉCENT EN PREMIER
    // --------------------------------------------------------

    openTickets.sort(
        (a, b) =>

            new Date(b.updatedAt) -
            new Date(a.updatedAt)
    );

    container.innerHTML = "";

    // --------------------------------------------------------
    // AFFICHAGE
    // --------------------------------------------------------

    openTickets.forEach(
        ticket => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "ticket-item";

            item.innerHTML = `

                <div class="ticket-item-top">

                    <div class="ticket-item-title">

                        🎫
                        ${escapeHTML(
                            ticket.subject
                        )}

                    </div>

                    <span class="ticket-status">

                        🟢 Ouvert

                    </span>

                </div>

                <div class="ticket-item-info">

                    👤
                    ${escapeHTML(
                        ticket.discordName
                    )}

                    <br>

                    🆔
                    ${escapeHTML(
                        ticket.id
                    )}

                    <br>

                    📅
                    ${formatDate(
                        ticket.createdAt
                    )}

                </div>

                <button
                    type="button"
                    class="staff-button"
                    style="margin-top:12px;"
                    onclick="viewTicket('${ticket.id}')"
                >

                    👀 Voir le ticket

                </button>

            `;

            container.appendChild(
                item
            );

        }
    );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date) {

    try {

        return new Date(
            date
        ).toLocaleString(
            "fr-FR"
        );

    } catch {

        return "Date inconnue";

    }

}


// ============================================================
// AFFICHER UN TICKET
// ============================================================

function viewTicket(id) {

    // Ferme une éventuelle ancienne modale
    closeTicketModal();

    const tickets =
        getTickets();

    const ticket =
        tickets.find(
            ticket =>
                ticket.id === id
        );

    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;

    }

    const currentStaff =
        getCurrentStaff();

    if (!currentStaff) {

        alert(
            "❌ Tu dois être connecté en tant que Staff."
        );

        return;

    }

    // --------------------------------------------------------
    // MESSAGES
    // --------------------------------------------------------

    let messages = "";

    if (
        !Array.isArray(
            ticket.messages
        )
    ) {

        ticket.messages = [];

    }

    ticket.messages.forEach(
        message => {

            const staffLabel =
                message.staff
                    ? `
                        🛡️
                        ${escapeHTML(
                            message.role
                                ? getRoleName(
                                    message.role
                                )
                                : "Staff"
                        )}
                    `
                    : "👤 Membre";

            messages += `

                <div
                    style="
                        padding:15px;
                        margin-bottom:10px;
                        border-radius:10px;
                        background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.08);
                    "
                >

                    <strong>

                        ${staffLabel}

                        —
                        
                        ${escapeHTML(
                            message.author
                        )}

                    </strong>

                    <p
                        style="
                            margin:8px 0;
                            white-space:pre-wrap;
                            word-break:break-word;
                        "
                    >

                        ${escapeHTML(
                            message.message
                        )}

                    </p>

                    <small
                        style="
                            opacity:0.45;
                        "
                    >

                        ${formatDate(
                            message.date
                        )}

                    </small>

                </div>

            `;

        }
    );

    // --------------------------------------------------------
    // ACTIONS
    // --------------------------------------------------------

    let actions = "";

    if (
        ticket.status === "open"
    ) {

        actions = `

            <textarea
                id="ticketReply"
                placeholder="Écrire une réponse..."
                maxlength="3000"
                style="
                    width:100%;
                    min-height:120px;
                    padding:12px;
                    margin-top:15px;
                    border-radius:8px;
                    background:rgba(255,255,255,0.04);
                    border:1px solid rgba(255,255,255,0.12);
                    color:white;
                    resize:vertical;
                    box-sizing:border-box;
                "
            ></textarea>

            <button
                type="button"
                class="staff-button primary"
                style="margin-top:10px;"
                onclick="replyToTicket('${ticket.id}')"
            >

                💬 Répondre

            </button>

            <button
                type="button"
                class="staff-button"
                style="margin-top:10px;"
                onclick="closeTicket('${ticket.id}')"
            >

                🔒 Fermer le ticket

            </button>

        `;

    } else {

        actions = `

            <div
                class="empty-tickets"
                style="margin-top:15px;"
            >

                🔴 Ce ticket est fermé.

                ${
                    ticket.closedBy
                        ? `<br>
                           Fermé par :
                           ${escapeHTML(
                               ticket.closedBy
                           )}`
                        : ""
                }

            </div>

            <button
                type="button"
                class="staff-button primary"
                style="margin-top:10px;"
                onclick="reopenTicket('${ticket.id}')"
            >

                🔓 Réouvrir le ticket

            </button>

        `;

    }

    // --------------------------------------------------------
    // MODALE
    // --------------------------------------------------------

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "ticketModal";

    modal.style.cssText = `

        position:fixed;
        inset:0;
        z-index:9999;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:20px;

        background:rgba(0,0,0,0.80);

        backdrop-filter:blur(8px);

    `;

    modal.innerHTML = `

        <div
            style="
                width:100%;
                max-width:700px;
                max-height:90vh;
                overflow:auto;

                padding:25px;

                border-radius:14px;

                background:#0c0c0c;

                border:1px solid
                    rgba(255,255,255,0.12);

                box-shadow:
                    0 25px 80px
                    rgba(0,0,0,0.5);

                box-sizing:border-box;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    align-items:center;
                    margin-bottom:20px;
                "
            >

                <div>

                    <h2
                        style="
                            margin:0 0 8px 0;
                        "
                    >

                        🎫
                        ${escapeHTML(
                            ticket.subject
                        )}

                    </h2>

                    <p
                        style="
                            opacity:0.5;
                            margin:0;
                        "
                    >

                        👤
                        ${escapeHTML(
                            ticket.discordName
                        )}

                        <br>

                        🆔
                        ${escapeHTML(
                            ticket.id
                        )}

                    </p>

                </div>

                <button
                    type="button"
                    class="staff-button"
                    onclick="closeTicketModal()"
                >

                    ✕

                </button>

            </div>

            <div>

                ${messages}

            </div>

            ${actions}

        </div>

    `;

    // --------------------------------------------------------
    // FERMETURE EN CLIQUANT À L'EXTÉRIEUR
    // --------------------------------------------------------

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                closeTicketModal();

            }

        }
    );

    document.body.appendChild(
        modal
    );

}


// ============================================================
// FERMER MODALE
// ============================================================

function closeTicketModal() {

    const modal =
        document.getElementById(
            "ticketModal"
        );

    if (modal) {

        modal.remove();

    }

}


// ============================================================
// RÉPONDRE À UN TICKET
// ============================================================

function replyToTicket(id) {

    const currentStaff =
        getCurrentStaff();

    if (!currentStaff) {

        alert(
            "❌ Tu dois être connecté en tant que Staff."
        );

        return;

    }

    const input =
        document.getElementById(
            "ticketReply"
        );

    if (!input) {
        return;
    }

    const message =
        input.value.trim();

    if (!message) {

        alert(
            "❌ Le message est vide."
        );

        return;

    }

    if (message.length > 3000) {

        alert(
            "❌ Message trop long."
        );

        return;

    }

    const tickets =
        getTickets();

    const ticket =
        tickets.find(
            ticket =>
                ticket.id === id
        );

    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;

    }

    if (
        ticket.status === "closed"
    ) {

        alert(
            "❌ Ce ticket est fermé."
        );

        return;

    }

    const now =
        new Date().toISOString();

    if (
        !Array.isArray(
            ticket.messages
        )
    ) {

        ticket.messages = [];

    }

    ticket.messages.push({

        id:
            generateId(),

        author:
            currentStaff.name,

        message:
            message,

        staff:
            true,

        role:
            currentStaff.role,

        date:
            now

    });

    ticket.updatedAt =
        now;

    saveTickets(
        tickets
    );

    closeTicketModal();

    viewTicket(id);

}


// ============================================================
// FERMER UN TICKET
// ============================================================

function closeTicket(id) {

    const currentStaff =
        getCurrentStaff();

    if (!currentStaff) {

        alert(
            "❌ Tu dois être connecté en tant que Staff."
        );

        return;

    }

    const tickets =
        getTickets();

    const ticket =
        tickets.find(
            ticket =>
                ticket.id === id
        );

    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;

    }

    if (
        ticket.status === "closed"
    ) {

        alert(
            "❌ Ce ticket est déjà fermé."
        );

        return;

    }

    const confirmation =
        confirm(
            "Voulez-vous vraiment fermer ce ticket ?"
        );

    if (!confirmation) {
        return;
    }

    const now =
        new Date().toISOString();

    ticket.status =
        "closed";

    ticket.updatedAt =
        now;

    ticket.closedAt =
        now;

    ticket.closedBy =
        currentStaff.name;

    saveTickets(
        tickets
    );

    closeTicketModal();

    renderTicketsList();

}


// ============================================================
// RÉOUVRIR UN TICKET
// ============================================================

function reopenTicket(id) {

    const currentStaff =
        getCurrentStaff();

    if (!currentStaff) {

        alert(
            "❌ Tu dois être connecté en tant que Staff."
        );

        return;

    }

    const tickets =
        getTickets();

    const ticket =
        tickets.find(
            ticket =>
                ticket.id === id
        );

    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;

    }

    if (
        ticket.status === "open"
    ) {

        alert(
            "❌ Ce ticket est déjà ouvert."
        );

        return;

    }

    ticket.status =
        "open";

    ticket.updatedAt =
        new Date().toISOString();

    ticket.closedAt =
        null;

    ticket.closedBy =
        null;

    saveTickets(
        tickets
    );

    closeTicketModal();

    renderTicketsList();

}


// ============================================================
// CONNEXION STAFF
// ============================================================

function loginStaff() {

    const input =
        document.getElementById(
            "staffDiscordName"
        );

    if (!input) {

        console.error(
            "❌ Champ staffDiscordName introuvable."
        );

        return;

    }

    const name =
        input.value.trim();

    if (!name) {

        alert(
            "❌ Entre ton nom Discord."
        );

        return;

    }

    const staff =
        getStaff();

    const member =
        staff.find(
            user =>

                user.name &&
                user.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (!member) {

        alert(
            "❌ Tu n'as aucun accès Staff."
        );

        return;

    }

    setCurrentStaff(
        member
    );

    updateStaffInterface();

    console.log(
        `✅ Connexion Staff : ${member.name}`
    );

}


// ============================================================
// DÉCONNEXION STAFF
// ============================================================

function logoutStaff() {

    clearCurrentStaff();

    updateStaffInterface();

    closeTicketModal();

    console.log(
        "👋 Staff déconnecté."
    );

}


// ============================================================
// INTERFACE STAFF
// ============================================================

function updateStaffInterface() {

    const currentStaff =
        getCurrentStaff();

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

    // --------------------------------------------------------
    // PAS D'INTERFACE STAFF SUR LA PAGE
    // --------------------------------------------------------

    if (!status) {

        renderTicketsList();

        return;

    }

    // --------------------------------------------------------
    // CONNECTÉ
    // --------------------------------------------------------

    if (currentStaff) {

        status.innerHTML = `

            <strong>

                ${escapeHTML(
                    currentStaff.name
                )}

            </strong>

            <span>

                ${getRoleName(
                    currentStaff.role
                )}

            </span>

        `;

        if (loginButton) {

            loginButton.style.display =
                "none";

        }

        if (logoutButton) {

            logoutButton.style.display =
                "inline-flex";

        }

    }

    // --------------------------------------------------------
    // NON CONNECTÉ
    // --------------------------------------------------------

    else {

        status.innerHTML = `

            <strong>

                Non connecté

            </strong>

            <span>

                Connecte-toi pour accéder
                aux tickets.

            </span>

        `;

        if (loginButton) {

            loginButton.style.display =
                "inline-flex";

        }

        if (logoutButton) {

            logoutButton.style.display =
                "none";

        }

    }

    renderTicketsList();

}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeStaff();

        initializeTicketForm();

        updateStaffInterface();

        console.log(
            "🎫 Génération Dorée - Système de tickets chargé."
        );

    }
);


// ============================================================
// EXPORT DES FONCTIONS
// ============================================================

window.loginStaff =
    loginStaff;

window.logoutStaff =
    logoutStaff;

window.viewTicket =
    viewTicket;

window.closeTicket =
    closeTicket;

window.reopenTicket =
    reopenTicket;

window.replyToTicket =
    replyToTicket;

window.closeTicketModal =
    closeTicketModal;

window.renderTicketsList =
    renderTicketsList;

window.updateStaffInterface =
    updateStaffInterface;