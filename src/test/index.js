import {admin, default as Admin} from '../'

describe("Admin", () => {
  var module = null
  describe("Load", () => {
    it("should not be null", () => {
      admin.should.not.be.null
      Admin.should.not.be.null
    })

    it("should be instantiated", () => (module = new Admin({})).should.not.be.null)
  })
})
