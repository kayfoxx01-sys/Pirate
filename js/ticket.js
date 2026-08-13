// ============================================================
// GÉNÉRATION DORÉE
// SYSTÈME DE TICKETS
// API DISTANTE
// ============================================================

const TICKETS_API =
    "http://147.135.213.131:20166";


// ============================================================
// OUTILS
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

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
// CRÉER UN TICKET
// ============================================================

function initializeTicketForm() {

    const form =
        document.getElementById(
            "ticketForm"
        );

    if (!form) {
        return;
    }

    if (
        form.dataset.ticketInitialized ===
        "true"
    ) {
        return;
    }

    form.dataset.ticketInitialized =
        "true";

    form.addEventListener(
        "submit",
        async function(event) {

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

            try {

                const response =
                    await fetch(
                        `${TICKETS_API}/api/tickets`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    subject:
                                        subject,

                                    message:
                                        message

                                })

                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    showTicketMessage(
                        `❌ ${data.message || "Impossible de créer le ticket."}`,
                        "error"
                    );

                    return;

                }

                form.reset();

                showTicketMessage(
                    `✅ Ticket créé ! Numéro : ${data.ticket.id}`,
                    "success"
                );

                console.log(
                    "🎫 Ticket créé :",
                    data.ticket
                );

                await renderTicketsList();

            } catch (error) {

                console.error(
                    "❌ Création ticket :",
                    error
                );

                showTicketMessage(
                    "❌ Impossible de contacter le serveur.",
                    "error"
                );

            }

        }
    );

}


// ============================================================
// RÉCUPÉRER LES TICKETS STAFF
// ============================================================

async function getStaffTickets() {

    try {

        const response =
            await fetch(
                `${TICKETS_API}/api/staff/tickets`,
                {
                    method:
                        "GET",

                    credentials:
                        "include"
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

        return data.tickets || [];

    } catch (error) {

        console.error(
            "❌ Récupération tickets :",
            error
        );

        return null;

    }

}


// ============================================================
// AFFICHAGE DES TICKETS
// ============================================================

async function renderTicketsList() {

    const container =
        document.getElementById(
            "ticketsList"
        );

    if (!container) {
        return;
    }

    const currentUser =
        await getCurrentUser();

    if (!currentUser) {

        container.innerHTML = `

            <div class="empty-tickets">

                🔒 Connecte-toi avec Discord
                pour voir les tickets.

            </div>

        `;

        return;

    }

    if (!currentUser.isStaff) {

        container.innerHTML = `

            <div class="empty-tickets">

                🚫 Ton compte Discord n'a pas
                accès à l'espace Staff.

            </div>

        `;

        return;

    }

    const tickets =
        await getStaffTickets();

    if (tickets === null) {

        container.innerHTML = `

            <div class="empty-tickets">

                ❌ Impossible de récupérer les tickets.

            </div>

        `;

        return;

    }

    const openTickets =
        tickets.filter(
            ticket =>
                ticket.status === "open"
        );

    if (!openTickets.length) {

        container.innerHTML = `

            <div class="empty-tickets">

                📭 Aucun ticket ouvert actuellement.

            </div>

        `;

        return;

    }

    container.innerHTML =
        "";

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
                        ticket.userName
                    )}

                    <br>

                    🆔
                    ${escapeHTML(
                        ticket.id
                    )}

                    <br>

                    💬
                    ${ticket.messageCount}
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
// VOIR UN TICKET
// ============================================================

async function viewTicket(id) {

    closeTicketModal();

    try {

        const response =
            await fetch(
                `${TICKETS_API}/api/tickets/${encodeURIComponent(id)}`,
                {
                    method:
                        "GET",

                    credentials:
                        "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                `❌ ${data.message || "Accès refusé."}`
            );

            return;

        }

        const ticket =
            data.ticket;

        let messages =
            "";

        if (
            Array.isArray(
                ticket.messages
            )
        ) {

            ticket.messages.forEach(
                message => {

                    const label =
                        message.staff
                            ? "🛡️ Staff"
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

                                ${label}

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

        }

        let actions =
            "";

        if (
            ticket.status ===
            "open"
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

                </div>

            `;

        }

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
                    border:1px solid rgba(255,255,255,0.12);
                    box-shadow:0 25px 80px rgba(0,0,0,0.5);
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

                        <h2 style="margin:0 0 8px 0;">

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

    } catch (error) {

        console.error(
            "❌ Affichage ticket :",
            error
        );

        alert(
            "❌ Impossible de récupérer le ticket."
        );

    }

}


// ============================================================
// RÉPONDRE
// ============================================================

async function replyToTicket(id) {

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

    try {

        const response =
            await fetch(
                `${TICKETS_API}/api/staff/tickets/${encodeURIComponent(id)}/messages`,
                {

                    method:
                        "POST",

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({
                            message
                        })

                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                `❌ ${data.message || "Impossible de répondre."}`
            );

            return;

        }

        closeTicketModal();

        await viewTicket(id);

        await renderTicketsList();

    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Erreur de connexion au serveur."
        );

    }

}


// ============================================================
// FERMER
// ============================================================

async function closeTicket(id) {

    if (
        !confirm(
            "Voulez-vous vraiment fermer ce ticket ?"
        )
    ) {

        return;

    }

    try {

        const response =
            await fetch(
                `${TICKETS_API}/api/staff/tickets/${encodeURIComponent(id)}/close`,
                {

                    method:
                        "POST",

                    credentials:
                        "include"

                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                `❌ ${data.message || "Impossible de fermer le ticket."}`
            );

            return;

        }

        closeTicketModal();

        await renderTicketsList();

    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Erreur de connexion au serveur."
        );

    }

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
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initializeTicketForm();

        await updateAuthInterface();

        await renderTicketsList();

        console.log(
            "🎫 Génération Dorée - Système de tickets chargé."
        );

    }
);


// ============================================================
// EXPORT
// ============================================================

window.loginDiscord =
    loginDiscord;

window.logoutDiscord =
    logoutDiscord;

window.viewTicket =
    viewTicket;

window.closeTicket =
    closeTicket;

window.replyToTicket =
    replyToTicket;

window.closeTicketModal =
    closeTicketModal;

window.renderTicketsList =
    renderTicketsList;