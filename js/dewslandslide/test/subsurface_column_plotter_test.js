const { expect } = chai;

describe("delegateSubsurfaceColumnsOnDropDown", () => {

	it("should create <select> tag", () => {
		$("body").append($("<select>", {
            id: "subsurface_column"
        }));
        const find_tag = $("body").find("#subsurface_column").length;
        expect(find_tag).to.equal(1);
	});

	it("should create <option> tag", () => {
		const columns = [{name: "agbta"}, {name: "agbsb"}];
		delegateSubsurfaceColumnsOnDropDown(columns);
		const find_tag = $("#subsurface_column").find("option").length;
		expect(find_tag).to.equal(2);
	});

	it("should have <option> for AGBTA", () => {
		const find_tag = $("#subsurface_column").find("option:contains('AGBTA')").length;
		expect(find_tag).to.equal(1);
	});

	it("should have <option> for AGBSB", () => {
		const find_tag = $("#subsurface_column").find("option:contains('AGBSB')").length;
		expect(find_tag).to.equal(1);
	});

	it("should remove <select> tag subsurface_column", () => {
		$("#subsurface_column").remove();
		const find_tag = $("#body").find("#subsurface_column").length;
		expect(find_tag).to.equal(0);
	});

});


