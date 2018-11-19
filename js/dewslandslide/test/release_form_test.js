const { expect } = chai;
function appendInput(type, selector, name, value) {
    const temp = { [selector]: name, type, value };
    $("body").append($("<input>", temp));
}

describe("clearZeroAndXFromTrigger", () => {
    it("G0 should be G", () => {
        const trigger = clearZeroAndXFromTrigger("G0");
        expect(trigger).to.equal("G");
    });

    it("Rx should be R", () => {
        const trigger = clearZeroAndXFromTrigger("Rx");
        expect(trigger).to.equal("R");
    });

    it("s should remain s", () => {
        const trigger = clearZeroAndXFromTrigger("s");
        expect(trigger).to.equal("s");
    });
});

describe("groupTriggersByType", () => {
    let order = null;

    before("describe constants", () => {
        const trigger = "R";
        const event_triggers = [
            { timestamp: "2010-09-03", trigger_type: "R", id: 1 },
            { timestamp: "2010-09-04", trigger_type: "G", id: 2 },
            { timestamp: "2010-10-05", trigger_type: "R", id: 3 },
            { timestamp: "2010-09-03", trigger_type: "S", id: 4 },
            { timestamp: "2010-11-03", trigger_type: "R", id: 5 }
        ];
        const group = groupTriggersByType(trigger, event_triggers);
        order = group.map(({ id }) => id).join("");
    });

    it("should fail in this test", () => {
        expect(order).to.not.equal("324", "should fail");
    });

    it("should group triggers correctly and order 531", () => {
        expect(order).to.equal("531");
    });
});

describe("removeTriggersFromSameGroup", () => {
    it("should prioritize capital triggers over smaller ones", () => {
        const trigger_list = ["S", "s", "G", "g", "M", "R"];
        const processed = removeTriggersFromSameGroup(trigger_list).join("");
        expect(processed).to.equal("SGMR");
    });

    it("should prioritize triggers with 0 over both capital and smaller ones", () => {
        const trigger_list = ["S", "s", "s0", "G", "g", "M", "m0", "R"];
        const processed = removeTriggersFromSameGroup(trigger_list).join("");
        expect(processed).to.equal("s0Gm0R");
    });
});

const x0 = ["r0", "g0", "m0", "s0"];
function loadBeforeAndAfterAlertLevel(alert_level) {
    before(() => {
        ["M", "m", "R", "S", "s", "G", "g", "E", "D"].forEach((e) => { appendInput("checkbox", "class", "cbox_trigger", e); });
        ["ms", "gs", "ss", "rs", "es", "ds"].forEach((e) => { appendInput("checkbox", "class", "cbox_trigger_switch", e); });
        appendInput("checkbox", "class", "cbox_nd", "ND");
        appendInput("checkbox", "class", "cbox_trigger_rx", "");
        x0.forEach((e) => { appendInput("checkbox", "class", "cbox_trigger_nd", e); });
        publicAlertHandler(alert_level);
    });

    after(() => {
        $(".cbox_trigger").remove();
        $(".cbox_trigger_switch").remove();
        $(".cbox_nd").remove();
        $(".cbox_trigger_nd, .cbox_trigger_rx").remove();
    });
}

describe("onPublicAlertChange", () => {
    describe("If none is chosen", () => {
        loadBeforeAndAfterAlertLevel("");

        it("cbox_trigger_switch for Manifestation is disabled", () => {
            expect($(".cbox_trigger_switch").prop("disabled")).to.equal(true);
        });

        it("ND button is disabled", () => {
            expect($(".cbox_nd[value=ND]").prop("disabled")).to.equal(true);
        });
    });

    describe("A0", () => {
        loadBeforeAndAfterAlertLevel("A0");

        it("cbox_trigger_switch for Manifestation is enabled", () => {
            expect($(".cbox_trigger_switch[value=ms]").prop("disabled")).to.equal(false);
        });

        it("cbox_trigger_switch for the rest is disabled", () => {
            expect($(".cbox_trigger_switch").not("[value=ms]").prop("disabled")).to.equal(true);
        });

        it("cbox_trigger M is disabled", () => {
            expect($(".cbox_trigger[value=M]").prop("disabled")).to.equal(true);
        });

        it("cbox_trigger m is disabled", () => {
            expect($(".cbox_trigger[value=m]").prop("disabled")).to.equal(true);
        });

        it("ND button is enabled", () => {
            expect($(".cbox_nd[value=ND]").prop("disabled")).to.equal(false);
        });

        describe("ND button (x0) of triggers must be disabled", () => {
            x0.forEach((e) => {
                it(`${e} is disabled`, () => {
                    expect($(`.cbox_trigger_nd[value=${e}]`).prop("disabled")).to.equal(true);
                });
            });
        });

        it("Rx button is disabled", () => {
            expect($(".cbox_trigger_rx").prop("disabled")).to.equal(true);
        });
    });
});

// describe("test", () => {
//     it.only("test", () => {
//         ["M", "m", "R", "S", "s", "G", "g", "E", "D"].forEach((e) => { appendInput("checkbox", "class", "cbox_trigger", e); });
//         $(".cbox_trigger[value=S]").prop("disabled", true);
//         appendInput("checkbox", "class", "cbox_nd", "ND");
//         console.log($(".cbox_trigger").prop("disabled"));
//         console.log($(".cbox_trigger[value=S]").prop("disabled"));
//         console.log($(".cbox_nd").prop("disabled"));
//     });
// });
