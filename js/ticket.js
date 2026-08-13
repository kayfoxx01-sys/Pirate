// ============================================================
// GÉNÉRATION DORÉE
// SYSTÈME DE TICKETS LOCAL
// ============================================================

const TICKETS_STORAGE_KEY =
    "generation_doree_tickets";


// ============================================================
// OUTILS
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


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
// STOCKAGE
// ============================================================

function getTickets() {

    try {

        const data =
            localStorage.getItem(
                TICKETS_STORAGE_KEY
            );

        if (!data) {
            return [];
        }

        const tickets =
            JSON.parse(data);

        return Array.isArray(tickets)
            ? tickets
            : [];

    } catch {

        return [];

    }

}


function saveTickets(tickets) {

    localStorage.setItem(
        TICKETS_STORAGE_KEY,
        JSON.stringify(tickets)
    );

}


// ============================================================
// MESSAGE
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
// CRÉATION
// ============================================================

function initializeTicketForm() {

    const form =
        document.getElementById(
            "ticketForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        event => {

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
                    "ticketMessageInput"
                );


            if (
                !nameInput ||
                !subjectInput ||
                !messageInput
            ) {
                return;
            }


            const name =
                nameInput.value.trim();

            const subject =
                subjectInput.value.trim();

            const message =
                messageInput.value.trim();


            if (!name) {

                showTicketMessage(
                    "❌ Entre ton nom Discord.",
                    "error"
                );

                return;

            }


            if (!subject) {

                showTicketMessage(
                    "❌ Entre le sujet.",
                    "error"
                );

                return;

            }


            if (!message) {

                showTicketMessage(
                    "❌ Explique ta demande.",
                    "error"
                );

                return;

            }


            const now =
                new Date().toISOString();


            const ticket = {

                id:
                    "GD-" +
                    Date.now()
                    .toString(36)
                    .toUpperCase(),

                userName:
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
                            crypto.randomUUID(),

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


            const tickets =
                getTickets();


            tickets.push(
                ticket
            );


            saveTickets(
                tickets
            );


            form.reset();


            showTicketMessage(
                `✅ Ticket créé ! Numéro : ${ticket.id}`,
                "success"
            );


            renderTicketsList();

        }
    );

}


// ============================================================
// AFFICHAGE STAFF
// ============================================================

function renderTicketsList() {

    const container =
        document.getElementById(
            "ticketsList"
        );

    if (!container) {
        return;
    }


    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        container.innerHTML = `

            <div class="empty-tickets">

                🔒 Connecte-toi avec ton compte Staff
                pour voir les tickets.

            </div>

        `;

        return;

    }


    const tickets =
        getTickets();


    const openTickets =
        tickets.filter(
            ticket =>
                ticket.status === "open"
        );


    if (!openTickets.length) {

        container.innerHTML = `

            <div class="empty-tickets">

                📭 Aucun ticket ouvert.

            </div>

        `;

        return;

    }


    container.innerHTML =
        "";


    openTickets
        .slice()
        .reverse()
        .forEach(
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
                            ticket.userName
                        )}

                        <br>

                        🆔
                        ${escapeHTML(
                            ticket.id
                        )}

                        <br>

                        💬
                        ${ticket.messages.length}
                        message(s)

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
// VOIR TICKET
// ============================================================

function viewTicket(id) {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {

        alert(
            "❌ Connecte-toi en tant que Staff."
        );

        return;

    }


    closeTicketModal();


    const tickets =
        getTickets();


    const ticket =
        tickets.find(
            item =>
                item.id === id
        );


    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;

    }


    let messages = "";


    ticket.messages.forEach(
        message => {

            const label =
                message.staff
                    ? "🛡️ Staff"
                    : "👤 Membre";


            messages += `

                <div class="ticket-chat-message">

                    <strong>

                        ${label}
                        —
                        ${escapeHTML(
                            message.author
                        )}

                    </strong>


                    <p>

                        ${escapeHTML(
                            message.message
                        )}

                    </p>


                    <small>

                        ${formatDate(
                            message.date
                        )}

                    </small>

                </div>

            `;

        }
    );


    let actions = "";


    if (
        ticket.status === "open"
    ) {

        actions = `

            <textarea
                id="ticketReply"
                class="ticket-reply"
                placeholder="Écrire une réponse..."
                maxlength="3000"
            ></textarea>


            <div class="ticket-modal-actions">

                <button
                    type="button"
                    class="staff-button primary"
                    onclick="replyToTicket('${ticket.id}')"
                >

                    💬 Répondre

                </button>


                <button
                    type="button"
                    class="danger-button"
                    onclick="closeTicket('${ticket.id}')"
                >

                    🔒 Fermer

                </button>

            </div>

        `;

    } else {

        actions = `

            <div class="empty-tickets">

                🔴 Ticket fermé.

            </div>

        `;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "ticketModal";


    modal.className =
        "ticket-modal";


    modal.innerHTML = `

        <div class="ticket-modal-content">

            <div class="ticket-modal-header">

                <div>

                    <h2>

                        🎫
                        ${escapeHTML(
                            ticket.subject
                        )}

                    </h2>


                    <p class="ticket-modal-info">

                        👤
                        ${escapeHTML(
                            ticket.userName
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


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
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
// RÉPONDRE
// ============================================================

function replyToTicket(id) {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
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


    const tickets =
        getTickets();


    const ticket =
        tickets.find(
            item =>
                item.id === id
        );


    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;

    }


    if (
        ticket.status !== "open"
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
            crypto.randomUUID(),

        author:
            currentUser.username,

        authorId:
            currentUser.username,

        message:
            message,

        staff:
            true,

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


    renderTicketsList();

}


// ============================================================
// FERMER TICKET
// ============================================================

function closeTicket(id) {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        return;
    }


    if (
        !confirm(
            "Voulez-vous vraiment fermer ce ticket ?"
        )
    ) {
        return;
    }


    const tickets =
        getTickets();


    const ticket =
        tickets.find(
            item =>
                item.id === id
        );


    if (!ticket) {

        alert(
            "❌ Ticket introuvable."
        );

        return;

    }


    ticket.status =
        "closed";


    ticket.updatedAt =
        new Date().toISOString();


    saveTickets(
        tickets
    );


    closeTicketModal();


    renderTicketsList();

}


// ============================================================
// MODALE
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
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTicketForm();

        updateAuthInterface();

        renderTicketsList();

        console.log(
            "🎫 Système de tickets chargé."
        );

    }
);


// ============================================================
// EXPORT
// ============================================================

window.viewTicket =
    viewTicket;

window.replyToTicket =
    replyToTicket;

window.closeTicket =
    closeTicket;

window.closeTicketModal =
    closeTicketModal;

window.renderTicketsList =
    renderTicketsList;