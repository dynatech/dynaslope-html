const { expect } = chai;

describe("create div container for rainfall buttons and charts", () => {

	it("should append div with id rainfall-plots", () => {
		const wrapper = $("body");
		wrapper.append($("<div>", {
            id: "rainfall-plots"
        }));
        const find_div = $("body").find("#rainfall-plots").length;
        expect(find_div).to.equal(1);
	});

	it("should append div with class plot-container in div rainfall-plots", () => {
		$("#rainfall-plots").append($("<div>", {
            class: "plot-container"
        }));
		const find_div = $("body").find(".plot-container").length;
        expect(find_div).to.equal(1);
	});

	it("should append div with id rainfall-sources-btn-group", () => {
		$("#rainfall-plots").append($("<div>", {
            id: "rainfall-sources-btn-group"
        }));
        const find_div = $("body").find("#rainfall-sources-btn-group").length;
        expect(find_div).to.equal(1);
	});

    it("should append div id = rainfall-plot-options", () => {
		$("#rainfall-plots").append($("<div>", {
            id: "rainfall-plot-options"
        }));
        const find_div = $("body").find("#rainfall-plot-options").length;
        expect(find_div).to.equal(1);
    });

});

describe("createRainSourcesButton", () => {

    it("should create rain sources", () => {
		const sources = [
		    { source_id: 1, id: 1, max_rain_2year: "122.4659", source_type: "arq", source_table: "agbtaw" },
		    { source_id: 3, id: 1, max_rain_2year: "122.4659", source_type: "noah", source_table: "557" },
		    { source_id: 4, id: 1, max_rain_2year: "122.4659", source_type: "noah", source_table: "1255" },
		    { source_id: 5, id: 1, max_rain_2year: "122.4659", source_type: "noah", source_table: "158" }
		];
		console.log(sources);
		createRainSourcesButton(sources);
		const find_button = $("#rainfall-sources-btn-group").find("button").length;
		expect(find_button).to.equal(4);
    });

    it("should have button AGBTAW", () => {
		const find_button = $("#rainfall-sources-btn-group").find("button:contains('AGBTAW')").length;
		expect(find_button).to.equal(1);
	});

	it("should have button NOAH 557", () => {
		const find_button = $("#rainfall-sources-btn-group").find("button:contains('NOAH 557')").length;
		expect(find_button).to.equal(1);
	});

	it("should have button NOAH 1255", () => {
		const find_button = $("#rainfall-sources-btn-group").find("button:contains('NOAH 1255')").length;
		expect(find_button).to.equal(1);
	});

	it("should have button NOAH 158", () => {
		const find_button = $("#rainfall-sources-btn-group").find("button:contains('NOAH 158')").length;
		expect(find_button).to.equal(1);
	});

	it("should remove all rain sources buttons", () => {
		$("#rainfall-sources-btn-group").empty();
		const find_button = $("#rainfall-sources-btn-group").find("button").length;
		expect(find_button).to.equal(0);
	});
});

describe("getRainDataSourcesPerSite", () => {

	it("should not return an empty array", () => {
		const site_code = "agb";
		getRainDataSourcesPerSite(site_code)
		.done((sources) => {
			const array_length = sources.length;
			console.log(array_length);
			expect(array_length).to.equal(4);
		});
	});


});

describe("createRainPlotSubtitle", () => {
	it("should return subtitle NOAH 557 (10.47 KM)", () => {
		const returned_subtitle = createRainPlotSubtitle("10.47","557");
		expect(returned_subtitle).to.equal("NOAH 557 (10.47 KM)");
	});

	it("should return subtitle AGBTAW", () => {
		const returned_subtitle = createRainPlotSubtitle(null,"agbtaw");
		expect(returned_subtitle).to.equal("AGBTAW");
	});
});
