const { expect } = chai;

describe("createInitialSubsurfaceAnalysis", () => {
    it("creates report correctly if data present", () => {
        const columns = [{ column_name: "agbta", status: "with_data" }];
        const trigger = createInitialSubsurfaceAnalysis(columns);
        expect(trigger).to.equal("<b>AGBTA</b> - [write analysis here]. ");
    });

    it("creates report correctly if data not present", () => {
        const columns = [{ column_name: "pngtb", status: "no_data" }];
        const trigger = createInitialSubsurfaceAnalysis(columns);
        expect(trigger).to.equal("No available data from <b>PNGTB</b> all throughout the shift. ");
    });

    it("creates report correctly if single column already deactivated", () => {
        const columns = [{ column_name: "pngta", status: "deactivated" }];
        const trigger = createInitialSubsurfaceAnalysis(columns);
        expect(trigger).to.equal("<b>PNGTA</b> is already deactivated. ");
    });
    
    it("creates report correctly if multiple columns already deactivated", () => {
        const columns = [
            { column_name: "agbsb", status: "deactivated" },
            { column_name: "pngta", status: "deactivated" }
        ];
        const trigger = createInitialSubsurfaceAnalysis(columns);
        expect(trigger).to.equal("<b>AGBSB and PNGTA</b> are already deactivated. ");
    });

    it("creates report correctly (multi-status columns)", () => {
        const columns = [
            { column_name: "agbta", status: "with_data" },
            { column_name: "agbsb", status: "deactivated" },
            { column_name: "pngta", status: "deactivated" },
            { column_name: "pngtb", status: "no_data" }
        ];
        const trigger = createInitialSubsurfaceAnalysis(columns);
        expect(trigger).to.equal("<b>AGBSB and PNGTA</b> are already deactivated. No available data from <b>PNGTB</b> all throughout the shift. <b>AGBTA</b> - [write analysis here]. ");
    });
});

describe("createInitialSurficialAnalysis", () => {
    it("creates report correctly if no data received", () => {
        const data = { hasSentSurficialData: false };
        const report = createInitialSurficialAnalysis(data);
        expect(report).to.equal("No surficial data received from LEWC");
    });
});
