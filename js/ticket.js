// ============================================================
// GÉNÉRATION DORÉE
// SYSTÈME DE TICKETS
// ============================================================


// ============================================================
// STOCKAGE
// ============================================================

const TICKETS_KEY = "generation_doree_tickets";

const STAFF_KEY = "generation_doree_staff";

const CURRENT_STAFF_KEY =
    "generation_doree_current_staff";


// ============================================================
// OUTILS
// ============================================================

function getTickets() {

    try {

        return JSON.parse(
            localStorage.getItem(TICKETS_KEY)
        ) || [];

    } catch {

        return [];
    }
}


function saveTickets(tickets) {

    localStorage.setItem(
        TICKETS_KEY,
        JSON.stringify(tickets)
    );
}


function getStaff() {

    try {

        return JSON.parse(
            localStorage.getItem(STAFF_KEY)
        ) || [];

    } catch {

        return [];
    }
}


function saveStaff(staff) {

    localStorage.setItem(
        STAFF_KEY,
        JSON.stringify(staff)
    );
}


function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


// ============================================================
// PANELS
// ============================================================

function hidePanels() {

    document
        .querySelectorAll(".ticket-panel")
        .forEach(panel => {

            panel.classList.add("hidden");

        });
}


function showCreateTicket() {

    hidePanels();

    document
        .getElementById("createTicket")
        .classList.remove("hidden");
}


function showMyTickets() {

    hidePanels();

    document
        .getElementById("myTickets")
        .classList.remove("hidden");

    renderMyTickets();
}


function showStaffLogin() {

    hidePanels();

    document
        .getElementById("staffLogin")
        .classList.remove("hidden");
}


// ============================================================
// CRÉATION TICKET
// ============================================================

document
    .getElementById("ticketForm")
    ?.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("discordName")
                    .value
                    .trim();


            const subject =
                document
                    .getElementById("ticketSubject")
                    .value
                    .trim();


            const message =
                document
                    .getElementById("ticketMessage")
                    .value
                    .trim();


            if (!name || !subject || !message) {

                alert(
                    "❌ Tous les champs sont obligatoires."
                );

                return;
            }


            const tickets =
                getTickets();


            // ------------------------------------------------
            // UN SEUL TICKET OUVERT PAR PERSONNE
            // ------------------------------------------------

            const existing =
                tickets.find(ticket =>

                    ticket.discordName
                        .toLowerCase() ===
                    name.toLowerCase()

                    &&
                    ticket.status === "open"

                );


            if (existing) {

                alert(
                    "⚠️ Tu as déjà un ticket ouvert."
                );

                return;
            }


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

                        date:
                            now
                    }

                ]

            };


            tickets.push(ticket);

            saveTickets(tickets);


            document
                .getElementById("ticketForm")
                .reset();


            alert(
                `✅ Ticket créé !\n\nNuméro : ${ticket.id}`
            );


            showMyTickets();

        }
    );


// ============================================================
// MES TICKETS
// ============================================================

function renderMyTickets() {

    const container =
        document.getElementById(
            "myTicketsList"
        );


    if (!container) {
        return;
    }


    const name =
        document
            .getElementById("discordName")
            ?.value
            ?.trim();


    const tickets =
        getTickets();


    if (!tickets.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                📭 Aucun ticket trouvé.
            </div>
            `;

        return;
    }


    container.innerHTML = "";


    tickets
        .slice()
        .reverse()
        .forEach(ticket => {

            const card =
                document.createElement("div");

            card.className =
                "ticket-card";


            const status =
                ticket.status === "open"
                    ? "🟢 Ouvert"
                    : "🔴 Fermé";


            card.innerHTML = `

                <div class="ticket-card-header">

                    <div>

                        <h3>
                            🎫 ${escapeHTML(ticket.subject)}
                        </h3>

                        <p>
                            👤 ${escapeHTML(ticket.discordName)}
                        </p>

                    </div>

                    <span class="ticket-status">
                        ${status}
                    </span>

                </div>

                <p>
                    📅
                    ${new Date(ticket.createdAt)
                        .toLocaleString("fr-FR")}
                </p>

                <button
                    class="main-button"
                    onclick="openTicket('${ticket.id}')"
                >
                    👀 Ouvrir
                </button>

            `;


            container.appendChild(card);

        });
}


// ============================================================
// STAFF LOGIN
// ============================================================

function loginStaff() {

    const name =
        document
            .getElementById("staffDiscordName")
            .value
            .trim();


    if (!name) {

        alert(
            "❌ Entre ton nom Discord."
        );

        return;
    }


    const staff =
        getStaff();


    const member =
        staff.find(user =>

            user.name
                .toLowerCase() ===
            name.toLowerCase()

        );


    if (!member) {

        alert(
            "❌ Tu n'as aucun accès Staff."
        );

        return;
    }


    localStorage.setItem(
        CURRENT_STAFF_KEY,
        JSON.stringify(member)
    );


    openStaffPanel();
}


// ============================================================
// STAFF PANEL
// ============================================================

function openStaffPanel() {

    const current =
        JSON.parse(
            localStorage.getItem(
                CURRENT_STAFF_KEY
            )
        );


    if (!current) {

        showStaffLogin();

        return;
    }


    hidePanels();


    document
        .getElementById("staffPanel")
        .classList.remove("hidden");


    document
        .getElementById("staffWelcome")
        .textContent =
            `Connecté en tant que ${current.name} • ${getRoleName(current.role)}`;


    renderStaffList();

    renderStaffTickets();

}


// ============================================================
// RÔLES
// ============================================================

function getRoleName(role) {

    if (role === "moderator") {

        return "🛡️ Modérateur";
    }

    if (role === "admin") {

        return "🔧 Administrateur";
    }

    if (role === "founder") {

        return "👑 Fondateur";
    }

    return "Inconnu";
}


function roleLevel(role) {

    if (role === "moderator") {
        return 1;
    }

    if (role === "admin") {
        return 2;
    }

    if (role === "founder") {
        return 3;
    }

    return 0;
}


// ============================================================
// AJOUT STAFF
// ============================================================

function addStaff() {

    const name =
        document
            .getElementById("newStaffName")
            .value
            .trim();


    const role =
        document
            .getElementById("newStaffRole")
            .value;


    if (!name) {

        alert(
            "❌ Entre un nom Discord."
        );

        return;
    }


    const current =
        JSON.parse(
            localStorage.getItem(
                CURRENT_STAFF_KEY
            )
        );


    if (!current) {
        return;
    }


    // Seul Fondateur peut gérer les accès

    if (
        current.role !== "founder"
    ) {

        alert(
            "❌ Seul un Fondateur peut gérer les accès Staff."
        );

        return;
    }


    const staff =
        getStaff();


    const existing =
        staff.find(user =>

            user.name
                .toLowerCase() ===
            name.toLowerCase()

        );


    if (existing) {

        existing.role =
            role;

    } else {

        staff.push({

            id:
                generateId(),

            name:
                name,

            role:
                role,

            createdAt:
                new Date().toISOString()

        });

    }


    saveStaff(staff);


    document
        .getElementById("newStaffName")
        .value = "";


    renderStaffList();


    alert(
        `✅ ${name} possède maintenant le rôle ${getRoleName(role)}.`
    );
}


// ============================================================
// LISTE STAFF
// ============================================================

function renderStaffList() {

    const container =
        document.getElementById(
            "staffList"
        );


    if (!container) {
        return;
    }


    const staff =
        getStaff();


    if (!staff.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                👥 Aucun membre Staff configuré.
            </div>
            `;

        return;
    }


    container.innerHTML = "";


    staff.forEach(member => {

        const card =
            document.createElement("div");

        card.className =
            "staff-card";


        card.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(member.name)}
                </strong>

                <span>
                    ${getRoleName(member.role)}
                </span>

            </div>

            <button
                class="danger-button"
                onclick="removeStaff('${member.id}')"
            >
                Retirer
            </button>

        `;


        container.appendChild(card);

    });
}


// ============================================================
// RETIRER STAFF
// ============================================================

function removeStaff(id) {

    const current =
        JSON.parse(
            localStorage.getItem(
                CURRENT_STAFF_KEY
            )
        );


    if (
        !current ||
        current.role !== "founder"
    ) {

        alert(
            "❌ Seul un Fondateur peut retirer un accès."
        );

        return;
    }


    const staff =
        getStaff();


    const member =
        staff.find(
            user => user.id === id
        );


    if (!member) {
        return;
    }


    if (
        !confirm(
            `Retirer l'accès Staff de ${member.name} ?`
        )
    ) {

        return;
    }


    const updated =
        staff.filter(
            user => user.id !== id
        );


    saveStaff(updated);

    renderStaffList();

}


// ============================================================
// TICKETS STAFF
// ============================================================

function renderStaffTickets() {

    const container =
        document.getElementById(
            "staffTicketsList"
        );


    if (!container) {
        return;
    }


    const tickets =
        getTickets();


    const openTickets =
        tickets.filter(
            ticket =>
                ticket.status === "open"
        );


    document
        .getElementById(
            "openTicketCount"
        )
        .textContent =
            openTickets.length;


    if (!openTickets.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                📭 Aucun ticket ouvert actuellement.
            </div>
            `;

        return;
    }


    container.innerHTML = "";


    openTickets
        .slice()
        .reverse()
        .forEach(ticket => {

            const card =
                document.createElement("div");

            card.className =
                "ticket-card";


            card.innerHTML = `

                <div class="ticket-card-header">

                    <div>

                        <h3>
                            🎫 ${escapeHTML(ticket.subject)}
                        </h3>

                        <p>
                            👤 ${escapeHTML(ticket.discordName)}
                        </p>

                    </div>

                    <span class="ticket-status">
                        🟢 Ouvert
                    </span>

                </div>

                <p>
                    📅
                    ${new Date(ticket.createdAt)
                        .toLocaleString("fr-FR")}
                </p>

                <button
                    class="main-button"
                    onclick="openTicket('${ticket.id}')"
                >
                    👀 Voir le ticket
                </button>

            `;


            container.appendChild(card);

        });
}


// ============================================================
// OUVRIR TICKET
// ============================================================

let previousPanel =
    null;


function openTicket(id) {

    previousPanel =
        document.querySelector(
            ".ticket-panel:not(.hidden)"
        );


    const tickets =
        getTickets();


    const ticket =
        tickets.find(
            item => item.id === id
        );


    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;
    }


    hidePanels();


    document
        .getElementById("ticketView")
        .classList.remove("hidden");


    renderTicket(ticket);

}


// ============================================================
// AFFICHAGE TICKET
// ============================================================

function renderTicket(ticket) {

    const container =
        document.getElementById(
            "ticketDetails"
        );


    const current =
        JSON.parse(
            localStorage.getItem(
                CURRENT_STAFF_KEY
            )
        );


    let messagesHTML = "";


    ticket.messages.forEach(message => {

        messagesHTML += `

            <div class="
                ticket-message
                ${message.staff ? "staff-message" : ""}
            ">

                <div class="message-author">

                    ${message.staff ? "🛠️" : "👤"}

                    ${escapeHTML(message.author)}

                </div>

                <div class="message-content">

                    ${escapeHTML(message.message)}

                </div>

                <small>

                    ${new Date(message.date)
                        .toLocaleString("fr-FR")}

                </small>

            </div>

        `;

    });


    const closeButton =
        ticket.status === "open"
            ? `
                <button
                    class="danger-button"
                    onclick="closeTicket('${ticket.id}')"
                >
                    🔒 Fermer le ticket
                </button>
            `
            : `
                <div class="closed-ticket">
                    🔴 Ce ticket est fermé.
                </div>
            `;


    container.innerHTML = `

        <div class="ticket-view-header">

            <div>

                <h2>
                    🎫 ${escapeHTML(ticket.subject)}
                </h2>

                <p>
                    👤 ${escapeHTML(ticket.discordName)}
                </p>

            </div>

            <span class="ticket-status">

                ${
                    ticket.status === "open"
                        ? "🟢 Ouvert"
                        : "🔴 Fermé"
                }

            </span>

        </div>


        <div class="ticket-messages">

            ${messagesHTML}

        </div>


        ${
            ticket.status === "open"
                ? `

                    <div class="reply-box">

                        <textarea
                            id="replyMessage"
                            placeholder="Écrire une réponse..."
                            maxlength="3000"
                        ></textarea>

                        <button
                            class="main-button"
                            onclick="replyToTicket('${ticket.id}')"
                        >
                            💬 Envoyer
                        </button>

                    </div>

                `
                : ""
        }


        <div class="ticket-actions">

            ${closeButton}

        </div>

    `;

}


// ============================================================
// RÉPONDRE
// ============================================================

function replyToTicket(id) {

    const current =
        JSON.parse(
            localStorage.getItem(
                CURRENT_STAFF_KEY
            )
        );


    if (!current) {

        alert(
            "❌ Tu dois être Staff."
        );

        return;
    }


    const message =
        document
            .getElementById("replyMessage")
            .value
            .trim();


    if (!message) {

        alert(
            "❌ Le message est vide."
        );

        return;
    }


    const tickets =
        getTickets();


    const ticket =
        tickets.find(
            item => item.id === id
        );


    if (!ticket) {
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


    ticket.messages.push({

        id:
            generateId(),

        author:
            current.name,

        message:
            message,

        staff:
            true,

        role:
            current.role,

        date:
            now

    });


    ticket.updatedAt =
        now;


    saveTickets(tickets);


    renderTicket(ticket);

}


// ============================================================
// FERMER TICKET
// ============================================================

function closeTicket(id) {

    const current =
        JSON.parse(
            localStorage.getItem(
                CURRENT_STAFF_KEY
            )
        );


    if (!current) {

        alert(
            "❌ Tu dois être Staff."
        );

        return;
    }


    const tickets =
        getTickets();


    const ticket =
        tickets.find(
            item => item.id === id
        );


    if (!ticket) {
        return;
    }


    if (
        !confirm(
            "Voulez-vous vraiment fermer ce ticket ?"
        )
    ) {

        return;
    }


    ticket.status =
        "closed";


    ticket.updatedAt =
        new Date().toISOString();


    saveTickets(tickets);


    renderTicket(ticket);


    renderStaffTickets();

}


// ============================================================
// DÉCONNEXION
// ============================================================

function logoutStaff() {

    localStorage.removeItem(
        CURRENT_STAFF_KEY
    );


    hidePanels();

    showStaffLogin();

}


// ============================================================
// RETOUR
// ============================================================

function backToPreviousPanel() {

    hidePanels();


    const current =
        JSON.parse(
            localStorage.getItem(
                CURRENT_STAFF_KEY
            )
        );


    if (current) {

        openStaffPanel();

        return;
    }


    showMyTickets();

}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Créer le premier Fondateur
        // uniquement si aucun Staff n'existe.

        const staff =
            getStaff();


        if (!staff.length) {

            staff.push({

                id:
                    generateId(),

                name:
                    "FONDATEUR",

                role:
                    "founder",

                createdAt:
                    new Date().toISOString()

            });


            saveStaff(staff);

        }

    }
);