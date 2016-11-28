import {AdminController} from '../'

describe("AdminController", () => {
  var module = null
  describe("Load", () => {
    it("should not be null", () => AdminController.should.not.be.null)

    it("should be instantiated", () => (module = new AdminController({})).should.not.be.null)
  })
})
