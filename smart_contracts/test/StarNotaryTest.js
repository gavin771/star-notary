const expectThrow = require("openzeppelin-solidity/test/helpers/expectThrow").expectThrow;
const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {

    beforeEach(async function () {
        this.contract = await StarNotary.new({ from: accounts[0] })
    })

    describe('can create a star', () => {
        //this tests that _mint is a function and works
        it('can create a star and get its name', async function () {
            await this.contract.createStar('awesome star!', 'dec', 'mag', 'cent', 'story', 1, { from: accounts[0] })
            assert.deepEqual(await this.contract.tokenIdToStarInfo(1), ['awesome star!', 'dec', 'mag', 'cent', 'story'])
        })

        it('cannot create a star with same coordinates', async function () {

            await this.contract.createStar('awesome star!', 'dec', 'mag', 'cent', 'story', 1, { from: accounts[0] })

            assert.deepEqual(await this.contract.tokenIdToStarInfo(1), ['awesome star!', 'dec', 'mag', 'cent', 'story'])

            await expectThrow(this.contract.createStar('awesome star!', 'dec', 'mag', 'cent', 'story', 2, { from: accounts[0] }), "VM Exception while processing transaction");

        })
    })

    describe('buying and selling stars', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]

        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar('awesome star!', 'dec', 'mag', 'cent', 'story', starId, { from: user1 })
        })

        it('user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })

            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })
            })

            it('user2 is the owner of the star after they buy it', async function () {
                await this.contract.buyStar(starId, { from: user2, value: starPrice, gasPrice: 0 })
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, { from: user2, value: overpaidAmount, gasPrice: 0 })
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    describe('can check if star exists', () => {
        it('should return true for existing star', async function () {
            await this.contract.createStar('awesome star!', '1dec', '2mag', '3cent', 'story', 1, { from: accounts[0] })
            assert.equal(await this.contract.checkIfStarExist('1dec', '2mag', '3cent'), true);
        })
        it('should return false for a star that doesn\'t exist', async function () {
            assert.equal(await this.contract.checkIfStarExist('nope', 'nope', 'never'), false);
        })
    })

    describe('can return price for a star on sale', () => {
        it('should return price for star on sale', async function () {
            let starPrice = web3.toWei(.01, "ether")

            await this.contract.createStar('awesome star!', '1dec', '2mag', '3cent', 'story', 1, { from: accounts[0] })
            await this.contract.putStarUpForSale(1, starPrice, { from: accounts[0] })
            assert.equal(await this.contract.starsForSale(1), starPrice);
        })
    })

    describe('ERC721 functions', () => {
        beforeEach(async function () {
            await this.contract.createStar('awesome star!', 'dec', 'mag', 'cent', 'story', 1001, { from: accounts[0] })
            await this.contract.createStar('awesome star!', '1dec', 'mag', 'cent', 'story', 1002, { from: accounts[1] })
        })

        it('approve()/getApproved()', async function () {
            await this.contract.approve(await this.contract.ownerOf(1002), 1001)
            assert.equal(await this.contract.getApproved(1001), await this.contract.ownerOf(1002))
        })
        it('safeTransferFrom()', async function () {
            const ownerOf1001 = await this.contract.ownerOf(1001);
            const ownerOf1002 = await this.contract.ownerOf(1002);

            await this.contract.safeTransferFrom(ownerOf1001, ownerOf1002, 1001);
            assert.equal(await this.contract.ownerOf(1001), ownerOf1002);

        })
        it('SetApprovalForAll()/isApprovedForAll()', async function () {
            await this.contract.setApprovalForAll(await this.contract.ownerOf(1002), true)
            assert.equal(await this.contract.isApprovedForAll(await this.contract.ownerOf(1001),await this.contract.ownerOf(1002)), true)

            await this.contract.setApprovalForAll(await this.contract.ownerOf(1002), false)
            assert.equal(await this.contract.isApprovedForAll(await this.contract.ownerOf(1001),await this.contract.ownerOf(1002)), false)
        })

        it('ownerOf()', async function () {
            assert.notEqual(await this.contract.ownerOf(1001), null);
        })
    })
})