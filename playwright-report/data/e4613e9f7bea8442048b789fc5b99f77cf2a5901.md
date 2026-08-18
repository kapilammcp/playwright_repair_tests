# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 4.Repair-UnderWarranty_RUG.spec.ts >> Repair RUG
- Location: tests\4.Repair-UnderWarranty_RUG.spec.ts:7:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]: "Database neutralized for testing: no emails sent, etc."
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - link "Home menu" [ref=e6] [cursor=pointer]:
        - /url: "#"
        - img
        - img "Helpdesk" [ref=e7]
        - generic [ref=e8]: Helpdesk
      - menu [ref=e9]:
        - menuitem "Overview" [ref=e10] [cursor=pointer]
        - button "Tickets" [ref=e12] [cursor=pointer]:
          - generic [ref=e13]: Tickets
        - button "Reporting" [ref=e15] [cursor=pointer]:
          - generic [ref=e16]: Reporting
        - button "Configuration" [ref=e18] [cursor=pointer]:
          - generic [ref=e19]: Configuration
        - button "Repair Diagnosis" [ref=e21] [cursor=pointer]:
          - generic [ref=e22]: Repair Diagnosis
      - menu [ref=e23]:
        - button "Attendance" [ref=e25] [cursor=pointer]:
          - img "Attendance" [ref=e26]: 
        - generic [ref=e28]:
          - button " Guides" [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: 
            - generic [ref=e31]: Guides
          - generic: "2"
        - button "Messages 114" [ref=e33] [cursor=pointer]:
          - img "Messages" [ref=e34]: 
          - generic [ref=e35]: "114"
        - button "Activities 38" [ref=e37] [cursor=pointer]:
          - img "Activities" [ref=e38]: 
          - generic [ref=e39]: "38"
        - generic:
          - button "Toggle Studio":
            - img: 
        - button "Jinasena Agricultural Machinery (Pvt) Ltd." [ref=e41] [cursor=pointer]:
          - text: 
          - generic [ref=e42]: Jinasena Agricultural Machinery (Pvt) Ltd.
        - generic: 
        - button "User" [ref=e44] [cursor=pointer]:
          - img "User" [ref=e45]
          - text: 
  - generic [ref=e48]:
    - generic [ref=e50]:
      - generic [ref=e51]:
        - button "New" [ref=e54] [cursor=pointer]
        - generic [ref=e55]:
          - list [ref=e56]:
            - listitem [ref=e57]:
              - button "" [ref=e59] [cursor=pointer]:
                - generic [ref=e60]: 
            - listitem [ref=e61]:
              - text: /
              - link "Customer Care - Repair" [ref=e62] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e63]:
              - text: /
              - link "REPAIR/2026/01093 (#1118)" [ref=e64] [cursor=pointer]:
                - /url: "#"
          - generic [ref=e65]:
            - generic [ref=e67]: REPAIR/2026/01093 (#1118)
            - button "" [ref=e71] [cursor=pointer]:
              - generic [ref=e72]: 
      - generic [ref=e75]:
        - button " 878 Tickets 662 Open" [ref=e76] [cursor=pointer]:
          - generic [ref=e77]: 
          - generic [ref=e78]:
            - generic [ref=e79]:
              - generic [ref=e81]: "878"
              - generic [ref=e82]: Tickets
            - generic [ref=e83]:
              - generic [ref=e85]: "662"
              - generic [ref=e86]: Open
        - button " 3 Movements" [ref=e87] [cursor=pointer]:
          - generic [ref=e88]: 
          - generic [ref=e89]:
            - generic [ref=e90]: "3"
            - generic [ref=e91]: Movements
      - generic [ref=e92]:
        - button "Search Knowledge Articles" [ref=e93] [cursor=pointer]:
          - img [ref=e94]
        - search [ref=e98]:
          - navigation "Pager" [ref=e99]:
            - generic [ref=e100]:
              - generic [ref=e101]: "1"
              - text: / 1
            - generic [ref=e102]:
              - button "Previous" [disabled]:
                - generic: 
              - button "Next" [disabled]:
                - generic: 
    - generic [ref=e104]:
      - generic [ref=e105]:
        - generic [ref=e106]:
          - button "Plan Intervention" [ref=e108] [cursor=pointer]
          - radiogroup "Statusbar" [ref=e110]:
            - button "More..." [ref=e111] [cursor=pointer]: ...
            - radio "Repair Started" [disabled]
            - radio "Estimation Approval Received" [disabled]
            - radio "Estimation Sent to Customer" [disabled]
            - radio "Diagnosis" [disabled]
            - radio "Received at Factory" [checked] [disabled]
            - radio "Sent to Factory1m" [disabled]
            - button "More..." [ref=e112] [cursor=pointer]: ...
        - generic [ref=e113]:
          - button [ref=e115] [cursor=pointer]
          - heading "REPAIR/2026/01093" [level=1] [ref=e118]:
            - generic [ref=e119]: REPAIR/2026/01093
          - generic [ref=e120]:
            - generic [ref=e121]:
              - generic [ref=e122]:
                - generic [ref=e124]: Assigned to
                - generic [ref=e127]:
                  - img [ref=e129]
                  - link "Kapila Hettiarachchi - New 17" [ref=e130] [cursor=pointer]:
                    - /url: "#id=8&model=res.users"
                    - generic [ref=e131]: Kapila Hettiarachchi - New 17
              - generic [ref=e132]:
                - generic [ref=e134]: Type
                - generic [ref=e137]: Repair - Under Warranty - RUG
              - generic [ref=e138]:
                - generic [ref=e140]: Return Receipt Location
                - link "BR-AM/Stock" [ref=e143] [cursor=pointer]:
                  - /url: "#id=768&model=stock.location"
                  - generic [ref=e144]: BR-AM/Stock
              - generic [ref=e145]:
                - generic [ref=e147]: Repair Location
                - link "BR-AM/Stock" [ref=e150] [cursor=pointer]:
                  - /url: "#id=768&model=stock.location"
                  - generic [ref=e151]: BR-AM/Stock
              - generic [ref=e152]:
                - generic [ref=e154]: Repair Reason
                - generic "Low Pressue" [ref=e158]:
                  - generic [ref=e159]: Low Pressue
              - generic [ref=e160]:
                - generic [ref=e162]: Job Location
                - generic [ref=e164]: Factory Repair
              - generic [ref=e165]:
                - generic [ref=e167]: Priority
                - radiogroup "Priority" [ref=e170]:
                  - radio "Medium priority" [ref=e171]: 
                  - radio "High priority" [ref=e172]: 
                  - radio "Urgent" [ref=e173]: 
              - generic [ref=e174]:
                - generic [ref=e176]: Re-estimate Status
                - generic [ref=e178]: None
              - generic [ref=e179]:
                - generic [ref=e181]: Re-estimate Count
                - generic [ref=e183]: "0"
            - generic [ref=e184]:
              - generic [ref=e185]:
                - generic [ref=e187]: Customer
                - link "KURUNEGALA CASH CUSTOMER" [ref=e190] [cursor=pointer]:
                  - /url: "#id=6087&model=res.partner"
                  - generic [ref=e191]: KURUNEGALA CASH CUSTOMER
              - generic [ref=e192]:
                - generic [ref=e194]: Email
                - generic [ref=e196]: sanjayarajans26407@gmail.com
              - generic [ref=e197]:
                - generic [ref=e199]: Phone
                - generic [ref=e203]:
                  - link "0372232202" [ref=e204] [cursor=pointer]:
                    - /url: tel:0372232202
                  - link " SMS" [ref=e205] [cursor=pointer]:
                    - /url: sms:0372232202
                    - generic [ref=e206]: 
                    - generic [ref=e207]: SMS
              - generic [ref=e208]:
                - generic [ref=e210]: Serial Number
                - link "1307_002" [ref=e213] [cursor=pointer]:
                  - /url: "#id=9807&model=stock.lot"
                  - generic [ref=e214]: 1307_002
              - generic [ref=e215]:
                - generic [ref=e217]:
                  - text: Product
                  - superscript [ref=e218]: "?"
                - link "[JMC6] Multi Chopper 6Hp (Tractor Type)" [ref=e221] [cursor=pointer]:
                  - /url: "#id=136394&model=product.product"
                  - generic [ref=e222]: "[JMC6] Multi Chopper 6Hp (Tractor Type)"
          - generic [ref=e223]:
            - list [ref=e225]:
              - listitem [ref=e226] [cursor=pointer]:
                - tab "Factory Repair Details" [ref=e227]
            - generic [ref=e229]:
              - generic [ref=e230]:
                - generic [ref=e231]:
                  - generic [ref=e233]: Repair Transfer Details (Sales Centre)
                  - generic [ref=e234]:
                    - generic [ref=e236]: Shipped Date
                    - generic [ref=e240]: 13/08/2026 15:06:08
                  - generic [ref=e241]:
                    - generic [ref=e243]: Shipped By
                    - link "Kapila Hettiarachchi - New 17" [ref=e246] [cursor=pointer]:
                      - /url: "#id=8&model=res.users"
                      - generic [ref=e247]: Kapila Hettiarachchi - New 17
                  - generic [ref=e250]: Received Date
                  - generic [ref=e254]: Received By
                - generic [ref=e257]:
                  - generic [ref=e259]: Repair Transfer Details (Factory)
                  - generic [ref=e262]: Shipped Date
                  - generic [ref=e266]: Shipped By
                  - generic [ref=e269]:
                    - generic [ref=e271]: Received Date
                    - generic [ref=e275]: 13/08/2026 15:06:09
                  - generic [ref=e276]:
                    - generic [ref=e278]: Received By
                    - link "Kapila Hettiarachchi - New 17" [ref=e281] [cursor=pointer]:
                      - /url: "#id=8&model=res.users"
                      - generic [ref=e282]: Kapila Hettiarachchi - New 17
              - generic [ref=e284]:
                - generic [ref=e286]: Delivery Details
                - generic [ref=e289]: Driver Name
                - generic [ref=e293]: Vehicle Details
          - list [ref=e297]:
            - listitem [ref=e298] [cursor=pointer]:
              - tab "Description" [ref=e299]
            - listitem [ref=e300] [cursor=pointer]:
              - tab "Extra Info" [ref=e301]
            - listitem [ref=e302] [cursor=pointer]:
              - tab "Warranty Details" [ref=e303]
            - listitem [ref=e304] [cursor=pointer]:
              - tab "Cancel/ Reopen Log" [ref=e305]
      - generic [ref=e311]:
        - generic [ref=e313]:
          - button "Send message" [ref=e314] [cursor=pointer]
          - button "Log note" [ref=e315] [cursor=pointer]
          - generic [ref=e316]:
            - button "Activities" [ref=e317] [cursor=pointer]
            - button "Search Messages" [ref=e319] [cursor=pointer]:
              - img [ref=e320]: 
            - button "Attach files" [ref=e322] [cursor=pointer]:
              - generic [ref=e323]: 
            - button "2" [ref=e325] [cursor=pointer]:
              - img [ref=e326]: 
              - superscript: "2"
            - button "Following" [ref=e327] [cursor=pointer]:
              - generic [ref=e329]: Following
        - generic [ref=e330]:
          - button "You're viewing older messages Jump to Present " [ref=e331] [cursor=pointer]:
            - generic [ref=e332]: You're viewing older messages
            - generic [ref=e333]: Jump to Present
            - generic [ref=e334]: 
          - generic [ref=e336]:
            - generic [ref=e337]:
              - separator [ref=e338]
              - generic [ref=e339]: Today
              - separator [ref=e340]
            - group "System notification" [ref=e341]:
              - generic [ref=e342]:
                - generic "Open card" [ref=e344] [cursor=pointer]:
                  - img [ref=e345]
                - generic [ref=e346]:
                  - generic [ref=e347]:
                    - generic "Open card" [ref=e348] [cursor=pointer]:
                      - strong [ref=e349]: Kapila Hettiarachchi - New 17
                    - generic "8/13/2026, 3:06:09 PM" [ref=e350]: "- now"
                  - generic [ref=e354]:
                    - paragraph [ref=e355]: Stage Changed
                    - list [ref=e356]:
                      - group [ref=e357]:
                        - text: Sent to Factory
                        - generic [ref=e358]: 
                        - text: Received at Factory
                        - generic [ref=e359]: (Stage)
                      - group [ref=e360]:
                        - text: Sent to Factory
                        - generic [ref=e361]: 
                        - text: Received at Factory
                        - generic [ref=e362]: (CCCC3)
            - group "System notification" [ref=e363]:
              - generic [ref=e364]:
                - generic "Open card" [ref=e366] [cursor=pointer]:
                  - img [ref=e367]
                - generic [ref=e368]:
                  - generic [ref=e369]:
                    - generic "Open card" [ref=e370] [cursor=pointer]:
                      - strong [ref=e371]: Kapila Hettiarachchi - New 17
                    - generic "8/13/2026, 3:06:08 PM" [ref=e372]: "- now"
                  - generic [ref=e376]:
                    - paragraph [ref=e377]: Stage Changed
                    - list [ref=e378]:
                      - group [ref=e379]:
                        - text: New
                        - generic [ref=e380]: 
                        - text: Sent to Factory
                        - generic [ref=e381]: (Stage)
                      - group [ref=e382]:
                        - text: New
                        - generic [ref=e383]: 
                        - text: Sent to Factory
                        - generic [ref=e384]: (CCCC3)
            - group "System notification" [ref=e385]:
              - generic [ref=e386]:
                - generic "Open card" [ref=e388] [cursor=pointer]:
                  - img [ref=e389]
                - generic [ref=e390]:
                  - generic [ref=e391]:
                    - generic "Open card" [ref=e392] [cursor=pointer]:
                      - strong [ref=e393]: Kapila Hettiarachchi - New 17
                    - generic "8/13/2026, 3:06:04 PM" [ref=e394]: "- now"
                  - generic [ref=e400]:
                    - link "BR-AM/RET/00342" [ref=e401] [cursor=pointer]:
                      - /url: "#"
                    - text: Return done
            - group "System notification" [ref=e402]:
              - generic [ref=e403]:
                - generic "Open card" [ref=e405] [cursor=pointer]:
                  - img [ref=e406]
                - generic [ref=e407]:
                  - generic [ref=e408]:
                    - generic "Open card" [ref=e409] [cursor=pointer]:
                      - strong [ref=e410]: Kapila Hettiarachchi - New 17
                    - generic "8/13/2026, 3:06:01 PM" [ref=e411]: "- now"
                  - list [ref=e416]:
                    - group [ref=e417]:
                      - text: None
                      - generic [ref=e418]: 
                      - text: KURUNEGALA CASH CUSTOMER
                      - generic [ref=e419]: (Customer)
                    - group [ref=e420]:
                      - text: None
                      - generic [ref=e421]: 
                      - text: "[JMC6] Multi Chopper 6Hp (Tractor Type)"
                      - generic [ref=e422]: (Product)
                    - group [ref=e423]:
                      - text: None
                      - generic [ref=e424]: 
                      - text: Repair - Under Warranty - RUG
                      - generic [ref=e425]: (Type)
            - group "System notification" [ref=e426]:
              - generic [ref=e427]:
                - generic "Open card" [ref=e429] [cursor=pointer]:
                  - img [ref=e430]
                - generic [ref=e431]:
                  - generic [ref=e432]:
                    - generic "Open card" [ref=e433] [cursor=pointer]:
                      - strong [ref=e434]: Kapila Hettiarachchi - New 17
                    - generic "8/13/2026, 3:05:43 PM" [ref=e435]: "- now"
                  - list [ref=e440]:
                    - group [ref=e441]:
                      - text: None
                      - generic [ref=e442]: 
                      - text: Kapila Hettiarachchi - New 17
                      - generic [ref=e443]: (Assigned to)
            - group "System notification" [ref=e444]:
              - generic [ref=e445]:
                - generic "Open card" [ref=e447] [cursor=pointer]:
                  - img [ref=e448]
                - generic [ref=e449]:
                  - generic [ref=e450]:
                    - generic "Open card" [ref=e451] [cursor=pointer]:
                      - strong [ref=e452]: Kapila Hettiarachchi - New 17
                    - generic "8/13/2026, 3:05:43 PM" [ref=e453]: "- now"
                  - paragraph [ref=e458]: Ticket created
  - generic:
    - dialog [ref=e459]:
      - generic [ref=e460]:
        - banner [ref=e461]:
          - button "Back to previous step" [ref=e462] [cursor=pointer]:
            - generic [ref=e463]: 
            - generic [ref=e464]: Back
          - button "Print" [ref=e466] [cursor=pointer]:
            - generic [ref=e467]: 
          - heading "Tasks from Tickets" [level=4] [ref=e468]
          - button "Close" [ref=e469] [cursor=pointer]
        - main [ref=e470]:
          - generic [ref=e472]:
            - generic [ref=e474]:
              - generic [ref=e478]:
                - button "Save manually" [ref=e479] [cursor=pointer]:
                  - generic [ref=e480]: 
                - button "Discard changes" [ref=e481] [cursor=pointer]:
                  - generic [ref=e482]: 
              - generic [ref=e484]:
                - button "Search Knowledge Articles" [ref=e485] [cursor=pointer]:
                  - img [ref=e486]
                - search [ref=e490]:
                  - navigation "Pager" [ref=e491]:
                    - generic [ref=e492]:
                      - generic [ref=e493]: "1"
                      - text: / 1
                    - generic [ref=e494]:
                      - button "Previous" [disabled]:
                        - generic: 
                      - button "Next" [disabled]:
                        - generic: 
            - generic [ref=e496]:
              - generic [ref=e497]:
                - generic [ref=e498]:
                  - button "Tested OK" [ref=e500] [cursor=pointer]
                  - generic:
                    - radiogroup "Statusbar"
                - generic [ref=e501]:
                  - heading "Priority REPAIR/2026/01093" [level=1] [ref=e503]:
                    - generic [ref=e504]:
                      - radiogroup "Priority" [ref=e506]:
                        - radio "High" [ref=e507] [cursor=pointer]: 
                      - textbox "Task Title..." [ref=e510]: REPAIR/2026/01093
                    - button "In Progress" [ref=e513]
                  - generic [ref=e515]:
                    - generic [ref=e516]:
                      - generic [ref=e517]:
                        - generic [ref=e519]: Project
                        - combobox "Project" [ref=e525]: JAM Product Repairs
                      - generic [ref=e526]:
                        - generic [ref=e528]:
                          - text: Worksheet Template
                          - superscript [ref=e529]: "?"
                        - combobox "Worksheet Template?" [ref=e535]: Repair Worksheet
                      - generic [ref=e536]:
                        - generic [ref=e538]: Assignees
                        - generic [ref=e541]:
                          - generic "Kapila Hettiarachchi - New 17" [ref=e542]:
                            - img [ref=e544]
                            - generic [ref=e545]: Kapila Hettiarachchi - New 17
                            - link "Delete" [ref=e546] [cursor=pointer]:
                              - /url: "#"
                              - generic [ref=e547]: 
                          - combobox "Assignees" [ref=e551]
                      - generic [ref=e552]:
                        - generic [ref=e554]: Help Desk Ticket
                        - combobox "Help Desk Ticket" [ref=e560]: REPAIR/2026/01093 (#1118)
                      - generic [ref=e561]:
                        - generic [ref=e563]: Created Date
                        - textbox "Created Date" [ref=e567] [cursor=pointer]: 13/08/2026 15:06:12
                    - generic [ref=e568]:
                      - generic [ref=e569]:
                        - generic [ref=e571]: Customer
                        - generic [ref=e573]:
                          - combobox [ref=e577]: KURUNEGALA CASH CUSTOMER
                          - generic [ref=e578]:
                            - text: KURUNEGALA
                            - text: Sri Lanka
                      - button " View Itinerary" [ref=e583] [cursor=pointer]:
                        - generic [ref=e584]: 
                        - text: View Itinerary
                      - generic [ref=e585]:
                        - generic [ref=e587]: Phone
                        - generic [ref=e591]:
                          - textbox "Phone Phone" [ref=e592]: "0372232202"
                          - text:  
                      - generic [ref=e593]:
                        - generic [ref=e595]: Planned Date
                        - generic [ref=e597]:
                          - generic [ref=e599]:
                            - textbox [ref=e600] [cursor=pointer]
                            - generic "Arrow icon" [ref=e601]: 
                            - textbox [ref=e602] [cursor=pointer]
                          - button "" [ref=e604] [cursor=pointer]
                  - generic [ref=e605]:
                    - list [ref=e607]:
                      - listitem [ref=e608] [cursor=pointer]:
                        - tab "Description" [ref=e609]
                      - listitem [ref=e610] [cursor=pointer]:
                        - tab "Sub-tasks" [ref=e611]
                      - listitem [ref=e612] [cursor=pointer]:
                        - tab "Repair Image" [ref=e613]
                      - listitem [ref=e614] [cursor=pointer]:
                        - tab "Warranty Card" [ref=e615]
                      - listitem [ref=e616] [cursor=pointer]:
                        - tab "Repair Diagnosis" [ref=e617]
                    - table [ref=e623]:
                      - rowgroup [ref=e624]:
                        - row "Description  Diagnosis Area  Diagnosis Code  Reason  Sub Reason  Resolution  Repair Stage  " [ref=e625]:
                          - columnheader [ref=e626] [cursor=pointer]
                          - columnheader "Description " [ref=e627] [cursor=pointer]:
                            - generic [ref=e628]:
                              - generic [ref=e629]: Description
                              - generic [ref=e630]: 
                          - columnheader "Diagnosis Area " [ref=e632] [cursor=pointer]:
                            - generic [ref=e633]:
                              - generic [ref=e634]: Diagnosis Area
                              - generic [ref=e635]: 
                          - columnheader "Diagnosis Code " [ref=e637] [cursor=pointer]:
                            - generic [ref=e638]:
                              - generic [ref=e639]: Diagnosis Code
                              - generic [ref=e640]: 
                          - columnheader "Reason " [ref=e642] [cursor=pointer]:
                            - generic [ref=e643]:
                              - generic [ref=e644]: Reason
                              - generic [ref=e645]: 
                          - columnheader "Sub Reason " [ref=e647] [cursor=pointer]:
                            - generic [ref=e648]:
                              - generic [ref=e649]: Sub Reason
                              - generic [ref=e650]: 
                          - columnheader "Resolution " [ref=e652] [cursor=pointer]:
                            - generic [ref=e653]:
                              - generic [ref=e654]: Resolution
                              - generic [ref=e655]: 
                          - columnheader "Repair Stage " [ref=e657] [cursor=pointer]:
                            - generic [ref=e658]:
                              - generic [ref=e659]: Repair Stage
                              - generic [ref=e660]: 
                          - columnheader "" [ref=e662]:
                            - button "" [ref=e664] [cursor=pointer]:
                              - generic [ref=e665]: 
                      - rowgroup [ref=e666]:
                        - row "Burnt Part Base plate Internal Hi Voltage Reject Internal link Delete row" [ref=e667]:
                          - cell [ref=e668] [cursor=pointer]
                          - cell [ref=e670] [cursor=pointer]:
                            - textbox [ref=e672]
                          - cell "Burnt Part" [ref=e673] [cursor=pointer]:
                            - combobox [ref=e678]: Burnt Part
                          - cell "Base plate" [ref=e679] [cursor=pointer]:
                            - combobox [ref=e684]: Base plate
                          - cell "Internal" [ref=e685] [cursor=pointer]:
                            - combobox [ref=e690]: Internal
                          - cell "Hi Voltage" [ref=e691] [cursor=pointer]:
                            - combobox [ref=e696]: Hi Voltage
                          - cell "Reject Internal link" [ref=e697] [cursor=pointer]:
                            - generic [ref=e699]:
                              - combobox [active] [ref=e702]: Reject
                              - button "Internal link" [ref=e703]: 
                          - cell [ref=e704] [cursor=pointer]:
                            - combobox [ref=e709]
                          - cell "Delete row" [ref=e710]:
                            - button "Delete row" [ref=e711] [cursor=pointer]: 
                        - row "Add a line" [ref=e712]:
                          - cell [ref=e713]
                          - cell "Add a line" [ref=e714]:
                            - button "Add a line" [ref=e715] [cursor=pointer]
                        - row [ref=e716]:
                          - cell [ref=e717]
                        - row [ref=e718]:
                          - cell [ref=e719]
                      - rowgroup [ref=e720]:
                        - row [ref=e721]:
                          - cell [ref=e722]
                          - cell [ref=e723]
                          - cell [ref=e724]
                          - cell [ref=e725]
                          - cell [ref=e726]
                          - cell [ref=e727]
                          - cell [ref=e728]
                          - cell [ref=e729]
                          - cell [ref=e730]
              - generic [ref=e732]:
                - generic [ref=e734]:
                  - button "Send message" [ref=e735] [cursor=pointer]
                  - button "Log note" [ref=e736] [cursor=pointer]
                  - generic [ref=e737]:
                    - button "Activities" [ref=e738] [cursor=pointer]
                    - button "Search Messages" [ref=e740] [cursor=pointer]:
                      - img [ref=e741]: 
                    - button "Attach files" [ref=e743] [cursor=pointer]:
                      - generic [ref=e744]: 
                    - button "1" [ref=e746] [cursor=pointer]:
                      - img [ref=e747]: 
                      - superscript: "1"
                    - button "Following" [ref=e748] [cursor=pointer]:
                      - generic [ref=e750]: Following
                - generic [ref=e751]:
                  - button "You're viewing older messages Jump to Present " [ref=e752] [cursor=pointer]:
                    - generic [ref=e753]: You're viewing older messages
                    - generic [ref=e754]: Jump to Present
                    - generic [ref=e755]: 
                  - generic [ref=e757]:
                    - generic [ref=e758]:
                      - separator [ref=e759]
                      - generic [ref=e760]: Today
                      - separator [ref=e761]
                    - group "System notification" [ref=e762]:
                      - generic [ref=e763]:
                        - generic "Open card" [ref=e765] [cursor=pointer]:
                          - img [ref=e766]
                        - generic [ref=e767]:
                          - generic [ref=e768]:
                            - generic "Open card" [ref=e769] [cursor=pointer]:
                              - strong [ref=e770]: Kapila Hettiarachchi - New 17
                            - generic "8/13/2026, 3:06:12 PM" [ref=e771]: "- now"
                          - paragraph [ref=e777]:
                            - text: "This task has been created from ticket:"
                            - link "REPAIR/2026/01093 (#1118)" [ref=e778] [cursor=pointer]:
                              - /url: "#"
                    - group "System notification" [ref=e779]:
                      - generic [ref=e780]:
                        - generic "Open card" [ref=e782] [cursor=pointer]:
                          - img [ref=e783]
                        - generic [ref=e784]:
                          - generic [ref=e785]:
                            - generic "Open card" [ref=e786] [cursor=pointer]:
                              - strong [ref=e787]: Kapila Hettiarachchi - New 17
                            - generic "8/13/2026, 3:06:12 PM" [ref=e788]: "- now"
                          - paragraph [ref=e793]: Task Created
    - generic:
      - paragraph: Press esc to exit full screen
    - generic [ref=e794]:
      - alert [ref=e795]:
        - strong [ref=e796]: Add Data
        - button "Close" [ref=e797] [cursor=pointer]:
          - generic [ref=e798]: 
        - generic [ref=e800]: Repair Diagnosis Validation is not set for this task. Please add the diagnosis.
      - alert [ref=e801]:
        - strong [ref=e802]: Add Data
        - button "Close" [ref=e803] [cursor=pointer]:
          - generic [ref=e804]: 
        - generic [ref=e806]: Repair Image is not set for this task. Please upload the repair image.
```

# Test source

```ts
  1   | import * as dotenv from 'dotenv';
  2   | import * as path from 'path';
  3   | import { Page } from '@playwright/test';
  4   | 
  5   | dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
  6   | 
  7   | export const BASE_URL = (process.env.ODOO_URL || '').replace(/\/$/, '');
  8   | 
  9   | export async function loginAndSelectCompany(page: Page): Promise<void> {
  10  |   const email = process.env.ODOO_EMAIL || '';
  11  |   const password = process.env.ODOO_PASSWORD || '';
  12  | 
  13  |   await page.goto(`${BASE_URL}/web/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  14  |   await page.fill('input[name="login"]', email);
  15  |   await page.fill('input[name="password"]', password);
  16  |   await page.locator('button[type="submit"]:not(.oe_search_button)').first().click();
  17  |   await page.waitForSelector('.o_main_navbar, .o_home_menu, .o_app', { timeout: 30_000 });
  18  | }
  19  | 
  20  | /**
  21  |  * Wait until Odoo 17's activity indicators are idle.
  22  |  *
  23  |  * Odoo 17 exposes overlapping loading signals:
  24  |  *   1. `.o_loading_indicator` — the bottom-right "Loading" toast. Odoo
  25  |  *      appears it ~400ms AFTER an RPC starts (debounced to prevent
  26  |  *      flashing on fast calls) and fades out with `.o-fade-leave` when
  27  |  *      the pending-request count drops to 0. On the staging build we
  28  |  *      also see the toast rendered without that class — it just says
  29  |  *      "Loading" — so we also check `.o_notification` bottom-right
  30  |  *      toasts and any text node containing "Loading".
  31  |  *   2. `.o_blockUI` (and body.o_ui_blocked) — the full-screen blocker
  32  |  *      used by `ui.block()` during form saves / server actions.
  33  |  *   3. `ui.isBlocked` on the Owl `ui` service — programmatic flag.
  34  |  *
  35  |  * Strategy (per user request): after any user action, grace-wait up to
  36  |  * `graceMs` (default 1000ms) for the loading indicator to APPEAR. If
  37  |  * it does, wait for it to fully disappear before returning. If it
  38  |  * doesn't appear in the grace window, we're already idle.
  39  |  *
  40  |  * This handles both fast RPCs (< 400ms, no indicator) and slow ones
  41  |  * (indicator appears and lingers) with a single predictable pattern.
  42  |  */
  43  | export async function waitForLoading(
  44  |   page: Page,
  45  |   timeoutMs = 60_000,
  46  |   graceMs = 1_000,
  47  | ): Promise<void> {
  48  |   const indicatorVisibleNow = () => page.evaluate(() => {
  49  |     const w = window as any;
  50  |     // Standard Odoo 17 selector
  51  |     const indicator = document.querySelector('.o_loading_indicator');
  52  |     if (indicator) {
  53  |       const style = getComputedStyle(indicator);
  54  |       if (style.display !== 'none'
  55  |           && style.visibility !== 'hidden'
  56  |           && !indicator.classList.contains('o-fade-leave')) {
  57  |         return true;
  58  |       }
  59  |     }
  60  |     // Backup selector — bottom-right "Loading" toast on some builds
  61  |     // renders as a plain badge/notification with visible "Loading" text
  62  |     for (const el of Array.from(document.querySelectorAll(
  63  |       '.o_notification, .o_loading, [class*="loading" i]'
  64  |     ))) {
  65  |       const style = getComputedStyle(el);
  66  |       if (style.display === 'none' || style.visibility === 'hidden') continue;
  67  |       const txt = (el as HTMLElement).innerText?.trim() ?? '';
  68  |       if (/loading/i.test(txt)) {
  69  |         // Ignore matches inside larger unrelated blocks — only bottom
  70  |         // right of viewport (bottom > vh - 200, right within 250px)
  71  |         const r = (el as HTMLElement).getBoundingClientRect();
  72  |         if (r.bottom >= window.innerHeight - 220 && r.right >= window.innerWidth - 300) {
  73  |           return true;
  74  |         }
  75  |       }
  76  |     }
  77  |     // Full-screen blocker checks
  78  |     if (document.querySelector('.o_blockUI')) return true;
  79  |     if (document.body.classList.contains('o_ui_blocked')) return true;
  80  |     try {
  81  |       if (w.odoo?.__WOWL_DEBUG__?.root?.env?.services?.ui?.isBlocked) return true;
  82  |     } catch { /* debug hook may not exist in production mode */ }
  83  |     return false;
  84  |   });
  85  | 
  86  |   // Phase 1: grace-wait for the indicator to appear.
  87  |   const graceDeadline = Date.now() + graceMs;
  88  |   let appeared = false;
  89  |   while (Date.now() < graceDeadline) {
  90  |     if (await indicatorVisibleNow()) { appeared = true; break; }
> 91  |     await page.waitForTimeout(80);
      |                ^ Error: page.waitForTimeout: Test timeout of 60000ms exceeded.
  92  |   }
  93  | 
  94  |   // Phase 2: if it appeared, wait for it to fully disappear.
  95  |   if (appeared) {
  96  |     const deadline = Date.now() + timeoutMs;
  97  |     while (Date.now() < deadline) {
  98  |       if (!(await indicatorVisibleNow())) {
  99  |         // Small stability window — sometimes the indicator flicks off
  100 |         // for ~50ms between chained RPCs. Re-check.
  101 |         await page.waitForTimeout(200);
  102 |         if (!(await indicatorVisibleNow())) return;
  103 |       }
  104 |       await page.waitForTimeout(100);
  105 |     }
  106 |     throw new Error(`waitForLoading: indicator still visible after ${timeoutMs}ms`);
  107 |   }
  108 |   // No indicator appeared within grace — already idle.
  109 | }
  110 | 
  111 | /**
  112 |  * Wait until the action manager has landed on a real, rendered view
  113 |  * (list / kanban / form) OR raised a dialog. Use this after actions that
  114 |  * transition between views (breadcrumb clicks, smart buttons, top-nav
  115 |  * clicks) — waitForLoading alone can return during the momentary gap
  116 |  * between "action manager fetch done" and "view arch rendered", which
  117 |  * looks idle from the RPC perspective but leaves the DOM without the
  118 |  * expected view container.
  119 |  */
  120 | export async function waitForView(page: Page, timeoutMs = 20_000): Promise<void> {
  121 |   await waitForLoading(page, timeoutMs);
  122 |   await page.waitForSelector(
  123 |     '.o_list_view, .o_kanban_view, .o_form_view, .o_dialog',
  124 |     { timeout: timeoutMs }
  125 |   );
  126 |   await waitForLoading(page, timeoutMs);
  127 | }
  128 | 
  129 | export async function dismissAnyModal(page: Page): Promise<void> {
  130 |   const closeBtn = page.locator('.o_dialog button').filter({ hasText: /^Close$/i }).first();
  131 |   if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
  132 |     await closeBtn.click();
  133 |     await page.waitForTimeout(300);
  134 |   }
  135 | }
  136 | 
  137 | export async function fillMany2one(page: Page, fieldName: string, value: string): Promise<void> {
  138 |   const widget = page.locator(`[name="${fieldName}"]`).first();
  139 | 
  140 |   // Selection <select> — pick by visible text
  141 |   const selEl = widget.locator('select').first();
  142 |   if (await selEl.count() > 0) {
  143 |     const options = await selEl.evaluate((s: HTMLSelectElement) =>
  144 |       Array.from(s.options).map(o => ({ value: o.value, text: o.text.trim() }))
  145 |     );
  146 |     const match = options.find(o => o.text.toLowerCase().includes(value.toLowerCase()));
  147 |     if (match) await selEl.selectOption(match.value);
  148 |     await waitForLoading(page);
  149 |     return;
  150 |   }
  151 | 
  152 |   // Many2one autocomplete <input>
  153 |   const input = widget.locator('input').first();
  154 |   await input.click();
  155 |   await input.fill(value);
  156 |   // Wait for the name_search RPC that populates the dropdown
  157 |   await waitForLoading(page);
  158 |   const menu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete').first();
  159 |   await menu.waitFor({ state: 'visible', timeout: 8_000 });
  160 |   const exact = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
  161 |     .filter({ hasText: value }).first();
  162 |   if (await exact.isVisible({ timeout: 1_500 }).catch(() => false)) {
  163 |     await exact.click();
  164 |   } else {
  165 |     const first = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
  166 |       .filter({ hasNotText: /loading|searching/i }).first();
  167 |     await first.click();
  168 |   }
  169 |   // Wait for the onchange RPC that fires after selection
  170 |   await waitForLoading(page);
  171 | }
  172 | 
  173 | export async function fillMany2oneByLabel(page: Page, labelText: string, value: string): Promise<void> {
  174 |   const fieldName = await page.evaluate((label: string) => {
  175 |     for (const el of Array.from(document.querySelectorAll('.o_form_label, label'))) {
  176 |       if ((el.textContent ?? '').trim().toLowerCase() === label.toLowerCase()) {
  177 |         const forId = el.getAttribute('for');
  178 |         if (forId) {
  179 |           const widget = document.getElementById(forId)?.closest('[name]');
  180 |           if (widget) return widget.getAttribute('name');
  181 |         }
  182 |         const next = el.nextElementSibling;
  183 |         if (next?.hasAttribute('name')) return next.getAttribute('name');
  184 |         const inner = next?.querySelector('[name]');
  185 |         if (inner) return inner.getAttribute('name');
  186 |         const td = el.closest('td, .o_td_label, .o_cell');
  187 |         if (td) {
  188 |           const sib = td.nextElementSibling;
  189 |           const w = (sib?.hasAttribute('name') ? sib : sib?.querySelector('[name]')) as Element | null;
  190 |           if (w) return w.getAttribute('name');
  191 |         }
```