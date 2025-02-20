import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect, should } from "chai";
import {ethers} from "hardhat";


describe("EnergyTrading Test", function () {
    const consumer = 2
    const producer =1
    const none = 0


    async function deployEnergyTestFixture() {
        const [owner, producerOne, producerTwo, consumerOne, consumerTwo] = await ethers.getSigners();

        const initialPrice = 1;

        // Token Deploy
        const EnergyCredits = await ethers.getContractFactory("EnergyCredits");
        const energycredits = await EnergyCredits.deploy();

     

        // Cross Grid deployment
        const CrossGrid = await ethers.getContractFactory("CrossGridContract");
        const crossGrid = await CrossGrid.deploy(initialPrice, energycredits.target);

        //    console.log("EnergyCredits Contract Address:", energycredits.target, "Cross grid Contract Address:", crossGrid.target);

        
        return { energycredits, owner, producerOne, producerTwo, consumerOne, consumerTwo, crossGrid };
    }

    it("should check if token contract was deployed", async function () {
        const { energycredits, owner  } = await loadFixture(deployEnergyTestFixture);

        const ownerBalance = await energycredits.connect(owner).balanceOf(owner.address)

        expect(ownerBalance).to.be.greaterThan(0)
    });

    it("should check if Cross Grid was deployed", async function () {
        const {  owner, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

        


        expect(await crossGrid.token()).to.be.equal(energycredits.target)
    });

    describe("User Registration", function () {
        it("Should register a user", async function () {
            const { owner, producerOne, crossGrid, consumerOne } = await loadFixture(deployEnergyTestFixture);
    
         
            await crossGrid.connect(producerOne).registerUser("anate", producer);
            const producerData = await crossGrid.users(producerOne.address);
            expect(producerData.name).to.equal("anate");
            expect(producerData.userType).to.equal(producer);
            expect(producerData.registered).to.equal(true);
    
        
            await crossGrid.connect(consumerOne).registerUser("abdullah", consumer);
            const consumerData = await crossGrid.users(consumerOne.address);
            expect(consumerData.name).to.equal("abdullah");
            expect(consumerData.userType).to.equal(consumer);
            expect(consumerData.registered).to.equal(true);
        });

        it("Should indicate a registered user", async function () {
            const { owner, producerOne, crossGrid, consumerOne } = await loadFixture(deployEnergyTestFixture);
    
         
            await crossGrid.connect(producerOne).registerUser("anate", producer);
            const registeredUser = await crossGrid.isRegistered(producerOne.address);
            expect(registeredUser).to.be.true;

            
           
    
        
          
            const notRegistered = await crossGrid.isRegistered(consumerOne.address);
            expect(notRegistered).to.be.false;
            
        });



        it("Should revert if the user is already registered", async function () {
            const { producerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);
    
          
            await crossGrid.connect(producerOne).registerUser("anate", producer);
    
           
            await expect(
                crossGrid.connect(producerOne).registerUser("anate", producer)
            ).to.be.revertedWith("User is already registered");
        });
    
        it("Should revert if an invalid user type is provided", async function () {
            const { consumerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);


           
            await expect(
                crossGrid.connect(consumerOne).registerUser("abdullah", none)
            ).to.be.revertedWith("Invalid user type");
        });

        it("Should emit a UserRegistered event on successful registration", async function () {
            const { producerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);
    
           
            await expect(
                crossGrid.connect(producerOne).registerUser("anate", producer)
            )
                .to.emit(crossGrid, "UserRegistered")
                .withArgs(producerOne.address, producer);
        });
    });

    describe("Energy Listing", function () {
        it("Should allow a registered producer to list energy", async function () {
            const { producerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);
        
            
            await crossGrid.connect(producerOne).registerUser("anate", producer);
        
            const ethAmount = "0.1";

            const price = ethers.parseUnits(ethAmount, "ether");
            const amount = 100;
            const energyType = 0;
        
            await crossGrid.connect(producerOne).listEnergy(amount, price, energyType)
            
        
            const listings = await crossGrid.energyListings(producerOne.address, 0); 

            expect(listings.producer).to.equal(producerOne.address);
            expect(listings.amount).to.equal(amount);
            expect(listings.price).to.equal(price);
            expect(listings.energyType).to.equal(energyType);
            expect(listings.active).to.equal(true);
        
            
            const totalSupply = await crossGrid.totalSupplyAggregated();
            expect(totalSupply).to.equal(amount);
        });

        it("should record listed energies of a producer", async function () {
            const { producerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);
        
            
            await crossGrid.connect(producerOne).registerUser("anate", producer);
        
            const ethAmount = "0.1";

            const price = ethers.parseUnits(ethAmount, "ether");
            const amount = 100;
            const energyType = 0;
        
            await crossGrid.connect(producerOne).listEnergy(amount, price, energyType)

            const producerListings = await crossGrid.getProducedRecords(producerOne.address)

            expect(producerListings.length).to.equal(1)

        })



        it("Should emit EnergyListed", async function () {
            const { producerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);
        
          
            await crossGrid.connect(producerOne).registerUser("anate", producer);
        
            const ethAmount = "0.1";

            const price = ethers.parseUnits(ethAmount, "ether");
            const amount = 100;
            const energyType = 0;
        
            await expect(
                crossGrid.connect(producerOne).listEnergy(amount, price, energyType)
            )
                .to.emit(crossGrid, "EnergyListed") 
                .withArgs(producerOne.address, amount, price, energyType);
        
           
        });
        
        
    
        it("Should revert if called by an unregistered producer", async function () {
            const { consumerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);
    
            const ethAmount = "0.1";

            const price = ethers.parseUnits(ethAmount, "ether");
            const amount = 100;
            const energyType = 0;
    
            await expect(
                crossGrid.connect(consumerOne).listEnergy(amount, price, energyType)
            ).to.be.revertedWith("Only registered producers can perform this action");
        });

    
        it("Should revert if amount or price is zero", async function () {
            const { producerOne, crossGrid } = await loadFixture(deployEnergyTestFixture);
    
            
            await crossGrid.connect(producerOne).registerUser("anate", producer);
    
            const invalidAmount = 0;
            const ethprice = "0.1";

            const validPrice = ethers.parseUnits(ethprice, "ether");
            const validAmount = 100;

            const invalidEthPricw = "0";

            const invalidPrice = ethers.parseUnits(invalidEthPricw, "ether");
            const energyType = 0;
    
          
            await expect(
                crossGrid.connect(producerOne).listEnergy(invalidAmount, validPrice, energyType)
            ).to.be.revertedWith("Amount must be greater than zero");
    
           
            await expect(
                crossGrid.connect(producerOne).listEnergy(validAmount, invalidPrice, energyType)
            ).to.be.revertedWith("Price must be greater than zero");
        });
    });


    describe("Energy purchase", function () {
        
            it("Should allow a registered consumer to buy energy from a producer", async function () {
                const { producerOne, owner, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

                const mintAmountEth = "5"
                const mintAmount = ethers.parseUnits(mintAmountEth, "ether");

                await energycredits.connect(owner).mint(mintAmount, consumerOne.address)
    
              
                await crossGrid.connect(producerOne).registerUser("anate", producer);
                await crossGrid.connect(consumerOne).registerUser("abdullah", consumer);
    
                
                const ethAmount = "0.1";
                const price = ethers.parseUnits(ethAmount, "ether");
                const amount = 100;
                const energyType = 0;
                await crossGrid.connect(producerOne).listEnergy(amount, price, energyType);

                const consumerBudgetinEth = "1"
                const consumerBudget =  ethers.parseUnits(consumerBudgetinEth, "ether");
    
                
                
                await energycredits.connect(consumerOne).approve(crossGrid.target, consumerBudget);

                const initialListings = await crossGrid.connect(owner).energyListings(producerOne.address, 0)
    
                
                await crossGrid.connect(consumerOne).buyEnergy(producerOne.address, 0, consumerBudget);
    
               const listings = await crossGrid.connect(owner).energyListings(producerOne.address, 0)

               expect ( listings.amount).to.be.lessThan(initialListings.amount)
            });

            it("Should emit EnergyPurchased event when a consumer buys energy", async function () {
                const { producerOne,owner, consumerOne, crossGrid, energycredits} = await loadFixture(deployEnergyTestFixture);

                
                const mintAmountEth = "5"
                const mintAmount = ethers.parseUnits(mintAmountEth, "ether");

                await energycredits.connect(owner).mint(mintAmount, consumerOne.address)
    
              
                await crossGrid.connect(producerOne).registerUser("anate", producer);
                await crossGrid.connect(consumerOne).registerUser("abdullah", consumer);
    
                const ethAmount = "0.1";
                const price = ethers.parseUnits(ethAmount, "ether");
                const amount = 100;
                const energyType = 0;
                await crossGrid.connect(producerOne).listEnergy(amount, price, energyType);

                const consumerBudgetinEth = "1"
                const consumerBudget =  ethers.parseUnits(consumerBudgetinEth, "ether");
    
                const amountTobuy = consumerBudget / price
                
                await energycredits.connect(consumerOne).approve(crossGrid.target, consumerBudget);
    
                // Step 4: Expect the "EnergyPurchased" event to be emitted when buying energy
                await expect(
                    crossGrid.connect(consumerOne).buyEnergy(producerOne.address, 0, consumerBudget)
                )
                    .to.emit(crossGrid, "EnergyBought")
                    .withArgs(producerOne.address, consumerOne.address,  amountTobuy, price);
            });
    
            it("Should revert if a consumer tries to buy energy without approval", async function () {
                const { producerOne, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);
    
                
                await crossGrid.connect(producerOne).registerUser("anate", producer);
                await crossGrid.connect(consumerOne).registerUser("abdullah", consumer);
    
                const ethAmount = "0.1";
                const price = ethers.parseUnits(ethAmount, "ether");
                const amount = 100;
                const energyType = 0;
                await crossGrid.connect(producerOne).listEnergy(amount, price, energyType);

                const consumerBudgetinEth = "1"
                const consumerBudget =  ethers.parseUnits(consumerBudgetinEth, "ether");
    
                
                await expect(
                    crossGrid.connect(consumerOne).buyEnergy(producerOne.address, 0, consumerBudget)
                ).to.be.revertedWith("Allowance insufficient");
            });

            it("Should revert if a consumer has insufficient balance", async function () {
                const { producerOne, owner, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

                const mintAmountEth = "0.09"
                const mintAmount = ethers.parseUnits(mintAmountEth, "ether");

                await energycredits.connect(owner).mint(mintAmount, consumerOne.address)
    
                
                await crossGrid.connect(producerOne).registerUser("anate", producer);
                await crossGrid.connect(consumerOne).registerUser("abdullah", consumer);
    
                const ethAmount = "0.1";
                const price = ethers.parseUnits(ethAmount, "ether");
                const amount = 100;
                const energyType = 0;
                await crossGrid.connect(producerOne).listEnergy(amount, price, energyType);

                const consumerBudgetinEth = "1"
                const consumerBudget =  ethers.parseUnits(consumerBudgetinEth, "ether");

                await energycredits.connect(consumerOne).approve(crossGrid.target, consumerBudget);
    
                
                await expect(
                    crossGrid.connect(consumerOne).buyEnergy(producerOne.address, 0, consumerBudget)
                ).to.be.revertedWith("Insufficient token balance");
            });


            it("Should revert if consumer tries to buy more than the amount of energy listed", async function () {
                const { producerOne,owner, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

                const mintAmountEth = "5"
                const mintAmount = ethers.parseUnits(mintAmountEth, "ether");

                await energycredits.connect(owner).mint(mintAmount, consumerOne.address)
    
              
                await crossGrid.connect(producerOne).registerUser("anate", producer);
                await crossGrid.connect(consumerOne).registerUser("abdullah", consumer);
    
                
                const ethAmount = "0.1";
                const price = ethers.parseUnits(ethAmount, "ether");
                const amount = 2;
                const energyType = 0;
                await crossGrid.connect(producerOne).listEnergy(amount, price, energyType);

                const consumerBudgetinEth = "1"
                const consumerBudget =  ethers.parseUnits(consumerBudgetinEth, "ether");
    
                
                
                await energycredits.connect(consumerOne).approve(crossGrid.target, consumerBudget);
    
                
                await expect(
                    crossGrid.connect(consumerOne).buyEnergy(producerOne.address, 0, consumerBudget)
                ).to.be.revertedWith("Invalid price or exceeds producer's supply");
            });


        
    
       
    
        
    });


    describe("Dispute Management", function () {
        it("should initiate a dispute", async function () {
            const { producerOne,owner, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

          await crossGrid.connect(producerOne).registerUser("anate", producer); 
          await crossGrid.connect(consumerOne).registerUser("abdullah", consumer); 

    
          await crossGrid.connect(consumerOne).initiateDispute(producerOne.address, "Energy not delivered");
    
          const disputes = await crossGrid.getDisputes();
          expect(disputes.length).to.equal(1);
          expect(disputes[0].reason).to.equal("Energy not delivered");
          expect(disputes[0].resolved).to.equal(false); 
        });
    
        it("should get a dispute", async function () {
            const { producerOne,owner, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

            await crossGrid.connect(producerOne).registerUser("anate", producer); 
          await crossGrid.connect(consumerOne).registerUser("abdullah", consumer); 
    
          await crossGrid.connect(consumerOne).initiateDispute(producerOne.address, "Energy not delivered");

          const dispute = await crossGrid.getDispute(0);
    
         
          expect(dispute.resolved).to.be.false;
        });

        it("should resolve a dispute", async function () {
            const { producerOne,owner, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

            await crossGrid.connect(producerOne).registerUser("anate", producer); 
          await crossGrid.connect(consumerOne).registerUser("abdullah", consumer); 
    
          await crossGrid.connect(consumerOne).initiateDispute(producerOne.address, "Energy not delivered");

          await crossGrid.resolveDispute(0, "");
    
          const disputes = await crossGrid.getDisputes();
          expect(disputes[0].resolved).to.equal(true);
        });


      });



      describe("Reset Data", function () {
        it("should reset user data", async function () {
            const { producerOne, crossGrid, owner } = await loadFixture(deployEnergyTestFixture);

            await crossGrid.connect(producerOne).registerUser("anate", producer); 

            const ethAmount = "0.1";
            const price = ethers.parseUnits(ethAmount, "ether");
            const amount = 100;
            const energyType = 0;
          
          await crossGrid.connect(producerOne).listEnergy(amount, price, energyType);
    
          await crossGrid.connect(owner).resetData(producerOne.address);
           expect( await crossGrid.totalProduced(producerOne.address)).to.equal(0);
        });
      });

      describe("getUserType", function () {

        it("should get the type of user", async function () {
            const { producerOne, crossGrid, owner } = await loadFixture(deployEnergyTestFixture);

            await crossGrid.connect(producerOne).registerUser("anate", producer); 

            const userType = await crossGrid.connect(owner).getUserType(producerOne.address)
          
            expect(userType).to.equal(producer)
        });

        it("should revert if user is not registered", async function () {
            const { producerOne, crossGrid, owner } = await loadFixture(deployEnergyTestFixture);
          
            await expect( crossGrid.connect(owner).getUserType(producerOne.address)).to.revertedWith("User is not registered")
        });


      });

      describe("fetchAllEnergyListings", function () {

        it("should get the type of user", async function () {
            const { producerOne, producerTwo, crossGrid, owner } = await loadFixture(deployEnergyTestFixture);

              // Step 1: Register producer
              await crossGrid.connect(producerOne).registerUser("anate", producer);
              await crossGrid.connect(producerTwo).registerUser("abdullah", producer);
        
              const ethAmount = "0.1";

              const price =ethers.parseUnits(ethAmount, "ether")

              const energyOne = {
                price :  ethers.parseUnits(ethAmount, "ether"),
                amount : 100,
                energyType : 0,
              }
              const energyTwo = {
                price :  ethers.parseUnits(ethAmount, "ether"),
                amount : 200,
                energyType : 1,
              }
  
           
          
              await crossGrid.connect(producerOne).listEnergy(energyOne.amount, energyOne.price, energyOne.energyType)
              await crossGrid.connect(producerTwo).listEnergy(energyTwo.amount, energyTwo.price, energyTwo.energyType)

              const allListings = await crossGrid.fetchAllEnergyListings();

              expect(allListings.length).to.equal(2);

                // Checkig if listed energy details are correct 
                expect(allListings[0].producer).to.equal(producerOne.address);
                expect(allListings[0].amount).to.equal(100);
                expect(allListings[0].price).to.equal(price);
                expect(allListings[0].energyType).to.equal(0); 


                expect(allListings[1].producer).to.equal(producerTwo.address);
                expect(allListings[1].amount).to.equal(200);
                expect(allListings[1].price).to.equal(price);
                expect(allListings[1].energyType).to.equal(1); 
        });
      });




  


      describe("Record Consumption", function () {
        it("should record an energy consumption", async function () {
            const { producerOne, owner, consumerOne, crossGrid, energycredits } = await loadFixture(deployEnergyTestFixture);

                const mintAmountEth = "5"
                const mintAmount = ethers.parseUnits(mintAmountEth, "ether");

                await energycredits.connect(owner).mint(mintAmount, consumerOne.address)
    
              
                await crossGrid.connect(producerOne).registerUser("anate", producer);
                await crossGrid.connect(consumerOne).registerUser("abdullah", consumer);
    
                
                const ethAmount = "0.1";
                const price = ethers.parseUnits(ethAmount, "ether");
                const amount = 100;
                const energyType = 0;
                await crossGrid.connect(producerOne).listEnergy(amount, price, energyType);

                const consumerBudgetinEth = "1"
                const consumerBudget =  ethers.parseUnits(consumerBudgetinEth, "ether");
    
                
                
                await energycredits.connect(consumerOne).approve(crossGrid.target, consumerBudget);
    
                
                await crossGrid.connect(consumerOne).buyEnergy(producerOne.address, 0, consumerBudget);

                const consumed = await crossGrid.getConsumedRecords(consumerOne.address)

                expect(consumed.length).to.equal(1)

                


         
        });
    
       
      });

    
    
    




});
