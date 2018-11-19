
const arg = process.argv.slice(2);
main(arg);

function main (args) {
    const [internal_alert] = args;
    const [initial_public, trig_str] = internal_alert.split("-");

    let public_alert = initial_public;
    if (initial_public === "ND") {
        public_alert = (typeof trig_str !== "undefined") ? "A1" : "A0";
    }

    let alert_description = "";

    if (public_alert === "A0") {
        alert_description = "No significant ground movement***OR***Movement reduced to non-significant rates";
        console.log(alert_description);
        return;
    }

    let triggers = trig_str.replace(/0|[r]?x/g, "");
    triggers = triggers.split("");

    const priorities = {
        S: { level: 2, inherent: 1, desc: "in sensors" },
        G: { level: 2, inherent: 2, desc: "in ground markers" },
        M: { level: 2, inherent: 3, desc: "as manifestation" },
        R: { level: 1, inherent: 4, desc: "recent rainfall" },
        E: { level: 1, inherent: 5, desc: "a recent earthquake" },
        D: { level: 0, inherent: 6 }
    };

    const processing = {
        level_2: {
            critical: [],
            significant: []
        },
        level_1: [],
        D: false
    };

    const { level_1, level_2: { critical, significant } } = processing;
    triggers.forEach((trigger) => {
        const uppercase = trigger.toUpperCase();
        const { level, desc } = priorities[uppercase];
        if (level === 2) {
            if (trigger === uppercase) critical.push(desc);
            else significant.push(desc);
        } else if (level === 0) processing.D = true;
        else level_1.push(desc);
    });

    if (critical.length !== 0) {
        const combined = joinArrayWithAnd(critical);
        alert_description += `Critical movement observed ${combined}`;
    }

    if (significant.length !== 0) {
        const combined = joinArrayWithAnd(significant);
        const message = `Significant movement observed ${combined}`;
        if (alert_description === "") alert_description += message;
        else {
            let connector = " and";
            if (critical.length > 1) connector = ";";
            alert_description += `${connector} ${message.charAt(0).toLowerCase()}${message.slice(1)}`;
        }
    }

    if (level_1.length !== 0) {
        const combined = joinArrayWithAnd(level_1);
        const message = `${combined} may trigger landslide`;
        if (critical.length === 0 && significant.length === 0) {
            alert_description += `${message.charAt(0).toUpperCase()}${message.slice(1)}`;
        } else {
            alert_description += `; ${message}`;
        }
    }

    if (processing.D) {
        if (alert_description === "") {
            alert_description += "[requester] requested monitoring due to [reason]";
        } else {
            alert_description += "; LEWC/LGU requested monitoring";
        }
    }

    console.log(alert_description);
}

function joinArrayWithAnd (arr) {
    return [arr.slice(0, -1).join(", "), arr.slice(-1)[0]].join(arr.length < 2 ? "" : " and ");
}
