# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 3C.Branch_Repair-Not Under Warranty(With Serial No)-Full Flow.spec.ts >> Repair RUG
- Location: tests\3C.Branch_Repair-Not Under Warranty(With Serial No)-Full Flow.spec.ts:7:5

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: page.evaluate: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]: "Database neutralized for testing: no emails sent, etc."
  - generic: "▶ Running: 3C.Branch_Repair-Not Under Warranty(With Serial No)-Full Flow.spec.ts — Repair RUG"
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - link "Home menu" [ref=e6] [cursor=pointer]:
        - /url: "#"
        - img
      - menu [ref=e7]:
        - button "Attendance" [ref=e9] [cursor=pointer]:
          - img "Attendance" [ref=e10]: 
        - generic [ref=e12]:
          - button " Guides" [ref=e13] [cursor=pointer]:
            - generic [ref=e14]: 
            - generic [ref=e15]: Guides
          - generic: "2"
        - button "Messages 114" [ref=e17] [cursor=pointer]:
          - img "Messages" [ref=e18]: 
          - generic [ref=e19]: "114"
        - button "Activities 38" [ref=e21] [cursor=pointer]:
          - img "Activities" [ref=e22]: 
          - generic [ref=e23]: "38"
        - generic:
          - button "Toggle Studio":
            - img: 
        - button "Jinasena Agricultural Machinery (Pvt) Ltd." [ref=e25] [cursor=pointer]:
          - text: 
          - generic [ref=e26]: Jinasena Agricultural Machinery (Pvt) Ltd.
        - generic: 
        - button "User" [ref=e28] [cursor=pointer]:
          - img "User" [ref=e29]
          - text: 
  - generic [ref=e32]:
    - generic [ref=e34]:
      - generic [ref=e35]:
        - button "New" [ref=e38] [cursor=pointer]
        - generic [ref=e39]:
          - generic [ref=e41]: REPAIR/2026/01228 (#1253)
          - button "" [ref=e45] [cursor=pointer]:
            - generic [ref=e46]: 
      - generic [ref=e49]:
        - button " 1 Tasks" [ref=e50] [cursor=pointer]:
          - generic [ref=e51]: 
          - generic [ref=e52]:
            - generic [ref=e53]: "1"
            - generic [ref=e54]: Tasks
        - button " 990 Tickets 739 Open" [ref=e55] [cursor=pointer]:
          - generic [ref=e56]: 
          - generic [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e60]: "990"
              - generic [ref=e61]: Tickets
            - generic [ref=e62]:
              - generic [ref=e64]: "739"
              - generic [ref=e65]: Open
        - button " 3 Movements" [ref=e66] [cursor=pointer]:
          - generic [ref=e67]: 
          - generic [ref=e68]:
            - generic [ref=e69]: "3"
            - generic [ref=e70]: Movements
      - generic [ref=e71]:
        - button "Search Knowledge Articles" [ref=e72] [cursor=pointer]:
          - img [ref=e73]
        - search [ref=e77]:
          - navigation "Pager" [ref=e78]:
            - generic [ref=e79]:
              - generic [ref=e80]: "1"
              - text: / 1
            - generic [ref=e81]:
              - button "Previous" [disabled]:
                - generic: 
              - button "Next" [disabled]:
                - generic: 
    - generic [ref=e83]:
      - generic [ref=e84]:
        - generic [ref=e85]:
          - button "Dispatch" [ref=e87] [cursor=pointer]
          - radiogroup "Statusbar" [ref=e89]:
            - button "More..." [ref=e90] [cursor=pointer]: ...
            - radio "Sent to Sales Centre" [disabled]
            - radio "Repair Completed1m" [checked] [disabled]
            - radio "Repair Started" [disabled]
            - radio "Estimation Approval Received1m" [disabled]
            - radio "Estimation Sent to Customer1m" [disabled]
            - button "More..." [ref=e91] [cursor=pointer]: ...
        - generic [ref=e92]:
          - button [ref=e94] [cursor=pointer]
          - heading "REPAIR/2026/01228" [level=1] [ref=e97]:
            - generic [ref=e98]: REPAIR/2026/01228
          - generic [ref=e99]:
            - generic [ref=e100]:
              - generic [ref=e101]:
                - generic [ref=e103]: Assigned to
                - generic [ref=e106]:
                  - img [ref=e108]
                  - link "Kapila Hettiarachchi - New 17" [ref=e109] [cursor=pointer]:
                    - /url: "#id=8&model=res.users"
                    - generic [ref=e110]: Kapila Hettiarachchi - New 17
              - generic [ref=e111]:
                - generic [ref=e113]: Type
                - generic [ref=e116]: Repair - Not Under Warranty (With Serial No)
              - generic [ref=e117]:
                - generic [ref=e119]: Return Receipt Location
                - link "BR-AM/Stock" [ref=e122] [cursor=pointer]:
                  - /url: "#id=768&model=stock.location"
                  - generic [ref=e123]: BR-AM/Stock
              - generic [ref=e124]:
                - generic [ref=e126]: Repair Location
                - link "BR-AM/Stock" [ref=e129] [cursor=pointer]:
                  - /url: "#id=768&model=stock.location"
                  - generic [ref=e130]: BR-AM/Stock
              - generic [ref=e131]:
                - generic [ref=e133]: Repair Reason
                - generic "Low Pressue" [ref=e137]:
                  - generic [ref=e138]: Low Pressue
              - generic [ref=e139]:
                - generic [ref=e141]: Job Location
                - generic [ref=e143]: Centre Repair
              - generic [ref=e144]:
                - generic [ref=e146]: Priority
                - radiogroup "Priority" [ref=e149]:
                  - radio "Medium priority" [ref=e150]: 
                  - radio "High priority" [ref=e151]: 
                  - radio "Urgent" [ref=e152]: 
              - generic [ref=e153]:
                - generic [ref=e155]: Re-estimate Status
                - generic [ref=e157]: None
              - generic [ref=e158]:
                - generic [ref=e160]: Re-estimate Count
                - generic [ref=e162]: "0"
            - generic [ref=e163]:
              - generic [ref=e164]:
                - generic [ref=e166]: Customer
                - link "KURUNEGALA CASH CUSTOMER" [ref=e169] [cursor=pointer]:
                  - /url: "#id=6087&model=res.partner"
                  - generic [ref=e170]: KURUNEGALA CASH CUSTOMER
              - generic [ref=e171]:
                - generic [ref=e173]: Email
                - generic [ref=e175]: sanjayarajans26407@gmail.com
              - generic [ref=e176]:
                - generic [ref=e178]: Phone
                - generic [ref=e182]:
                  - link "0372232202" [ref=e183] [cursor=pointer]:
                    - /url: tel:0372232202
                  - link " SMS" [ref=e184] [cursor=pointer]:
                    - /url: sms:0372232202
                    - generic [ref=e185]: 
                    - generic [ref=e186]: SMS
              - generic [ref=e187]:
                - generic [ref=e189]: Serial Number
                - link "0207_001" [ref=e192] [cursor=pointer]:
                  - /url: "#id=9796&model=stock.lot"
                  - generic [ref=e193]: 0207_001
              - generic [ref=e194]:
                - generic [ref=e196]:
                  - text: Product
                  - superscript [ref=e197]: "?"
                - link "[JMC6] Multi Chopper 6Hp (Tractor Type)" [ref=e200] [cursor=pointer]:
                  - /url: "#id=136394&model=product.product"
                  - generic [ref=e201]: "[JMC6] Multi Chopper 6Hp (Tractor Type)"
          - list [ref=e204]:
            - listitem [ref=e205] [cursor=pointer]:
              - tab "Description" [ref=e206]
            - listitem [ref=e207] [cursor=pointer]:
              - tab "Extra Info" [ref=e208]
            - listitem [ref=e209] [cursor=pointer]:
              - tab "Warranty Details" [ref=e210]
            - listitem [ref=e211] [cursor=pointer]:
              - tab "Cancel/ Reopen Log" [ref=e212]
      - generic [ref=e218]:
        - generic [ref=e220]:
          - button "Send message" [ref=e221] [cursor=pointer]
          - button "Log note" [ref=e222] [cursor=pointer]
          - generic [ref=e223]:
            - button "Activities" [ref=e224] [cursor=pointer]
            - button "Search Messages" [ref=e226] [cursor=pointer]:
              - img [ref=e227]: 
            - button "Attach files" [ref=e229] [cursor=pointer]:
              - generic [ref=e230]: 
            - button "2" [ref=e232] [cursor=pointer]:
              - img [ref=e233]: 
              - superscript: "2"
            - button "Following" [ref=e234] [cursor=pointer]:
              - generic [ref=e236]: Following
        - generic [ref=e237]:
          - button "You're viewing older messages Jump to Present " [ref=e238] [cursor=pointer]:
            - generic [ref=e239]: You're viewing older messages
            - generic [ref=e240]: Jump to Present
            - generic [ref=e241]: 
          - generic [ref=e243]:
            - generic [ref=e244]:
              - separator [ref=e245]
              - generic [ref=e246]: Today
              - separator [ref=e247]
            - group "System notification" [ref=e248]:
              - generic [ref=e249]:
                - generic "Open card" [ref=e251] [cursor=pointer]:
                  - img [ref=e252]
                - generic [ref=e253]:
                  - generic [ref=e254]:
                    - generic "Open card" [ref=e255] [cursor=pointer]:
                      - strong [ref=e256]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:07:11 AM" [ref=e257]: "- now"
                  - generic [ref=e261]:
                    - paragraph [ref=e262]: Task Done
                    - link "REPAIR/2026/01228" [ref=e264] [cursor=pointer]:
                      - /url: "#"
            - group "System notification" [ref=e265]:
              - generic [ref=e266]:
                - generic "Open card" [ref=e268] [cursor=pointer]:
                  - img [ref=e269]
                - generic [ref=e270]:
                  - generic [ref=e271]:
                    - generic "Open card" [ref=e272] [cursor=pointer]:
                      - strong [ref=e273]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:07:07 AM" [ref=e274]: "- now"
                  - generic [ref=e278]:
                    - paragraph [ref=e279]: Stage Changed
                    - list [ref=e280]:
                      - group [ref=e281]:
                        - text: Advance Received
                        - generic [ref=e282]: 
                        - text: Repair Completed
                        - generic [ref=e283]: (Stage)
                      - group [ref=e284]:
                        - text: Advance Received
                        - generic [ref=e285]: 
                        - text: Repair Completed
                        - generic [ref=e286]: (CCCC3)
            - group "System notification" [ref=e287]:
              - generic [ref=e288]:
                - generic "Open card" [ref=e290] [cursor=pointer]:
                  - img [ref=e291]
                - generic [ref=e292]:
                  - generic [ref=e293]:
                    - generic "Open card" [ref=e294] [cursor=pointer]:
                      - strong [ref=e295]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:06:56 AM" [ref=e296]: "- now"
                  - generic [ref=e300]:
                    - paragraph [ref=e301]: Stage Changed
                    - list [ref=e302]:
                      - group [ref=e303]:
                        - text: Estimation Approval Received
                        - generic [ref=e304]: 
                        - text: Advance Received
                        - generic [ref=e305]: (Stage)
                      - group [ref=e306]:
                        - text: Estimation Approval Received
                        - generic [ref=e307]: 
                        - text: Advance Received
                        - generic [ref=e308]: (CCCC3)
            - group "System notification" [ref=e309]:
              - generic [ref=e310]:
                - generic "Open card" [ref=e312] [cursor=pointer]:
                  - img [ref=e313]
                - generic [ref=e314]:
                  - generic [ref=e315]:
                    - generic "Open card" [ref=e316] [cursor=pointer]:
                      - strong [ref=e317]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:06:42 AM" [ref=e318]: "- now"
                  - generic [ref=e322]:
                    - paragraph [ref=e323]: Stage Changed
                    - list [ref=e324]:
                      - group [ref=e325]:
                        - text: Estimation Sent to Customer
                        - generic [ref=e326]: 
                        - text: Estimation Approval Received
                        - generic [ref=e327]: (Stage)
                      - group [ref=e328]:
                        - text: Estimation Sent to Customer
                        - generic [ref=e329]: 
                        - text: Estimation Approval Received
                        - generic [ref=e330]: (CCCC3)
            - group "System notification" [ref=e331]:
              - generic [ref=e332]:
                - generic "Open card" [ref=e334] [cursor=pointer]:
                  - img [ref=e335]
                - generic [ref=e336]:
                  - generic [ref=e337]:
                    - generic "Open card" [ref=e338] [cursor=pointer]:
                      - strong [ref=e339]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:06:19 AM" [ref=e340]: "- now"
                  - generic [ref=e344]:
                    - paragraph [ref=e345]: Stage Changed
                    - list [ref=e346]:
                      - group [ref=e347]:
                        - text: Diagnosis
                        - generic [ref=e348]: 
                        - text: Estimation Sent to Customer
                        - generic [ref=e349]: (Stage)
                      - group [ref=e350]:
                        - text: Diagnosis
                        - generic [ref=e351]: 
                        - text: Estimation Sent to Customer
                        - generic [ref=e352]: (CCCC3)
            - group "System notification" [ref=e353]:
              - generic [ref=e354]:
                - generic "Open card" [ref=e356] [cursor=pointer]:
                  - img [ref=e357]
                - generic [ref=e358]:
                  - generic [ref=e359]:
                    - generic "Open card" [ref=e360] [cursor=pointer]:
                      - strong [ref=e361]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:05:38 AM" [ref=e362]: "- now"
                  - generic [ref=e366]:
                    - paragraph [ref=e367]: Stage Changed
                    - list [ref=e368]:
                      - group [ref=e369]:
                        - text: New
                        - generic [ref=e370]: 
                        - text: Diagnosis
                        - generic [ref=e371]: (Stage)
                      - group [ref=e372]:
                        - text: New
                        - generic [ref=e373]: 
                        - text: Diagnosis
                        - generic [ref=e374]: (CCCC3)
            - group "System notification" [ref=e375]:
              - generic [ref=e376]:
                - generic "Open card" [ref=e378] [cursor=pointer]:
                  - img [ref=e379]
                - generic [ref=e380]:
                  - generic [ref=e381]:
                    - generic "Open card" [ref=e382] [cursor=pointer]:
                      - strong [ref=e383]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:05:38 AM" [ref=e384]: "- now"
                  - paragraph [ref=e390]:
                    - link "REPAIR/2026/01228" [ref=e391] [cursor=pointer]:
                      - /url: "#"
                    - text: Task created
            - group "System notification" [ref=e392]:
              - generic [ref=e393]:
                - generic "Open card" [ref=e395] [cursor=pointer]:
                  - img [ref=e396]
                - generic [ref=e397]:
                  - generic [ref=e398]:
                    - generic "Open card" [ref=e399] [cursor=pointer]:
                      - strong [ref=e400]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:05:33 AM" [ref=e401]: "- now"
                  - generic [ref=e407]:
                    - link "BR-AM/RET/00479" [ref=e408] [cursor=pointer]:
                      - /url: "#"
                    - text: Return done
            - group "System notification" [ref=e409]:
              - generic [ref=e410]:
                - generic "Open card" [ref=e412] [cursor=pointer]:
                  - img [ref=e413]
                - generic [ref=e414]:
                  - generic [ref=e415]:
                    - generic "Open card" [ref=e416] [cursor=pointer]:
                      - strong [ref=e417]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:05:31 AM" [ref=e418]: "- now"
                  - list [ref=e423]:
                    - group [ref=e424]:
                      - text: None
                      - generic [ref=e425]: 
                      - text: KURUNEGALA CASH CUSTOMER
                      - generic [ref=e426]: (Customer)
                    - group [ref=e427]:
                      - text: None
                      - generic [ref=e428]: 
                      - text: "[JMC6] Multi Chopper 6Hp (Tractor Type)"
                      - generic [ref=e429]: (Product)
                    - group [ref=e430]:
                      - text: None
                      - generic [ref=e431]: 
                      - text: Repair - Not Under Warranty (With Serial No)
                      - generic [ref=e432]: (Type)
            - group "System notification" [ref=e433]:
              - generic [ref=e434]:
                - generic "Open card" [ref=e436] [cursor=pointer]:
                  - img [ref=e437]
                - generic [ref=e438]:
                  - generic [ref=e439]:
                    - generic "Open card" [ref=e440] [cursor=pointer]:
                      - strong [ref=e441]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:05:15 AM" [ref=e442]: "- 46 seconds ago"
                  - list [ref=e447]:
                    - group [ref=e448]:
                      - text: None
                      - generic [ref=e449]: 
                      - text: Kapila Hettiarachchi - New 17
                      - generic [ref=e450]: (Assigned to)
            - group "System notification" [ref=e451]:
              - generic [ref=e452]:
                - generic "Open card" [ref=e454] [cursor=pointer]:
                  - img [ref=e455]
                - generic [ref=e456]:
                  - generic [ref=e457]:
                    - generic "Open card" [ref=e458] [cursor=pointer]:
                      - strong [ref=e459]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:05:14 AM" [ref=e460]: "- 47 seconds ago"
                  - paragraph [ref=e465]: Ticket created
  - generic:
    - generic:
      - dialog [ref=e466]:
        - generic [ref=e467]:
          - banner [ref=e468]:
            - button "Back to previous step" [ref=e469] [cursor=pointer]:
              - generic [ref=e470]: 
              - generic [ref=e471]: Back
            - button "Print" [ref=e473] [cursor=pointer]:
              - generic [ref=e474]: 
            - heading "Returned Picking" [level=4] [ref=e475]
            - button "Close" [ref=e476] [cursor=pointer]
          - main [ref=e477]:
            - generic [ref=e479]:
              - generic [ref=e486]:
                - button "Search Knowledge Articles" [ref=e487] [cursor=pointer]:
                  - img [ref=e488]
                - search [ref=e492]:
                  - navigation "Pager" [ref=e493]:
                    - generic [ref=e494]:
                      - generic [ref=e495]: "1"
                      - text: / 1
                    - generic [ref=e496]:
                      - button "Previous" [disabled]:
                        - generic: 
                      - button "Next" [disabled]:
                        - generic: 
              - generic [ref=e498]:
                - generic [ref=e499]:
                  - generic [ref=e500]:
                    - generic [ref=e501]:
                      - button "Validate" [ref=e502] [cursor=pointer]
                      - button "Print" [ref=e503] [cursor=pointer]
                      - button "Print Labels" [ref=e504] [cursor=pointer]: Print Labels
                      - button "CancelUser avatar placeholder" [ref=e505] [cursor=pointer]:
                        - text: Cancel
                        - img "User avatar placeholder" [ref=e507]
                    - radiogroup "Statusbar" [ref=e509]:
                      - radio "Done" [disabled]
                      - radio "Ready" [checked] [disabled]
                      - radio "Waiting" [disabled]
                      - radio "Draft" [disabled]
                  - generic [ref=e510]:
                    - heading "Priority BR-AM/RET/00480" [level=1] [ref=e512]:
                      - radiogroup "Priority" [ref=e514]:
                        - radio "Urgent" [ref=e515]: 
                      - generic [ref=e516]: BR-AM/RET/00480
                    - generic [ref=e517]:
                      - generic [ref=e518]:
                        - generic [ref=e519]:
                          - generic [ref=e522]: Delivery Address
                          - link "KURUNEGALA CASH CUSTOMER" [ref=e525] [cursor=pointer]:
                            - /url: "#id=6087&model=res.partner"
                            - generic [ref=e526]: KURUNEGALA CASH CUSTOMER
                        - generic [ref=e527]:
                          - generic [ref=e529]: Helpdesk Ticket Id
                          - link "REPAIR/2026/01228 (#1253)" [ref=e532] [cursor=pointer]:
                            - /url: "#id=2133&model=helpdesk.ticket"
                            - generic [ref=e533]: REPAIR/2026/01228 (#1253)
                        - generic [ref=e534]:
                          - generic [ref=e536]: Source Location
                          - link "Virtual Locations/Repair/Ekala" [ref=e539] [cursor=pointer]:
                            - /url: "#id=667&model=stock.location"
                            - generic [ref=e540]: Virtual Locations/Repair/Ekala
                      - generic [ref=e541]:
                        - generic [ref=e542]:
                          - generic [ref=e544]:
                            - text: Scheduled Date
                            - superscript [ref=e545]: "?"
                          - generic [ref=e550]: 11/09/2026 11:07:31
                        - generic [ref=e551]:
                          - generic [ref=e553]:
                            - text: Product Availability
                            - superscript [ref=e554]: "?"
                          - generic [ref=e556]: Available
                        - generic [ref=e557]:
                          - generic [ref=e559]: Ticket Sales Order
                          - link "S01148" [ref=e562] [cursor=pointer]:
                            - /url: "#id=4734&model=sale.order"
                            - generic [ref=e563]: S01148
                    - generic [ref=e564]:
                      - list [ref=e566]:
                        - listitem [ref=e567] [cursor=pointer]:
                          - tab "Operations" [ref=e568]
                        - listitem [ref=e569] [cursor=pointer]:
                          - tab "Additional Info" [ref=e570]
                        - listitem [ref=e571] [cursor=pointer]:
                          - tab "Note" [ref=e572]
                      - generic [ref=e574]:
                        - table [ref=e578]:
                          - rowgroup [ref=e579]:
                            - row "Product  Packaging  Demand  Quantity  Unit  " [ref=e580]:
                              - columnheader "Product " [ref=e581] [cursor=pointer]:
                                - generic [ref=e582]:
                                  - generic [ref=e583]: Product
                                  - generic [ref=e584]: 
                              - columnheader "Packaging " [ref=e586] [cursor=pointer]:
                                - generic [ref=e587]:
                                  - generic [ref=e588]: Packaging
                                  - generic [ref=e589]: 
                              - columnheader "Demand " [ref=e591] [cursor=pointer]:
                                - generic [ref=e592]:
                                  - generic [ref=e593]: Demand
                                  - generic [ref=e594]: 
                              - columnheader "Quantity " [ref=e596] [cursor=pointer]:
                                - generic [ref=e597]:
                                  - generic [ref=e598]: Quantity
                                  - generic [ref=e599]: 
                              - columnheader "Unit " [ref=e601] [cursor=pointer]:
                                - generic [ref=e602]:
                                  - generic [ref=e603]: Unit
                                  - generic [ref=e604]: 
                              - columnheader
                              - columnheader [ref=e606]
                              - columnheader "" [ref=e607]:
                                - button "" [ref=e609] [cursor=pointer]:
                                  - generic [ref=e610]: 
                          - rowgroup [ref=e611]:
                            - row "[JMC6] Multi Chopper 6Hp (Tractor Type) 1.0000 1.0000 pcs " [ref=e612]:
                              - cell "[JMC6] Multi Chopper 6Hp (Tractor Type)" [ref=e613] [cursor=pointer]
                              - cell [ref=e614] [cursor=pointer]
                              - cell "1.0000" [ref=e615] [cursor=pointer]
                              - cell "1.0000" [ref=e616] [cursor=pointer]
                              - cell "pcs" [ref=e617] [cursor=pointer]
                              - cell
                              - cell "" [ref=e618] [cursor=pointer]:
                                - button "" [ref=e619]
                              - cell [ref=e620]
                            - row [ref=e621]:
                              - cell [ref=e622]
                            - row [ref=e623]:
                              - cell [ref=e624]
                            - row [ref=e625]:
                              - cell [ref=e626]
                          - rowgroup [ref=e627]:
                            - row [ref=e628]:
                              - cell [ref=e629]
                              - cell [ref=e630]
                              - cell [ref=e631]
                              - cell [ref=e632]
                              - cell [ref=e633]
                              - cell
                              - cell [ref=e634]
                              - cell [ref=e635]
                        - button "Put in PackUser avatar placeholder" [ref=e636] [cursor=pointer]:
                          - text: Put in Pack
                          - img "User avatar placeholder" [ref=e638]
                - generic [ref=e640]:
                  - generic [ref=e642]:
                    - button "Send message" [ref=e643] [cursor=pointer]
                    - button "Log note" [ref=e644] [cursor=pointer]
                    - generic [ref=e645]:
                      - button "Activities" [ref=e646] [cursor=pointer]
                      - button "Search Messages" [ref=e648] [cursor=pointer]:
                        - img [ref=e649]: 
                      - button "Attach files" [ref=e651] [cursor=pointer]:
                        - generic [ref=e652]: 
                      - button "2" [ref=e654] [cursor=pointer]:
                        - img [ref=e655]: 
                        - superscript: "2"
                      - button "Following" [ref=e656] [cursor=pointer]:
                        - generic [ref=e658]: Following
                  - generic [ref=e659]:
                    - button "You're viewing older messages Jump to Present " [ref=e660] [cursor=pointer]:
                      - generic [ref=e661]: You're viewing older messages
                      - generic [ref=e662]: Jump to Present
                      - generic [ref=e663]: 
                    - generic [ref=e665]:
                      - generic [ref=e666]:
                        - separator [ref=e667]
                        - generic [ref=e668]: Today
                        - separator [ref=e669]
                      - group "System notification" [ref=e670]:
                        - generic [ref=e671]:
                          - generic "Open card" [ref=e673] [cursor=pointer]:
                            - img [ref=e674]
                          - generic [ref=e675]:
                            - generic [ref=e676]:
                              - generic "Open card" [ref=e677] [cursor=pointer]:
                                - strong [ref=e678]: Kapila Hettiarachchi - New 17
                              - generic "9/11/2026, 11:07:32 AM" [ref=e679]: "- now"
                            - paragraph [ref=e685]:
                              - text: "This transfer has been created from ticket:"
                              - link "REPAIR/2026/01228 (#1253)" [ref=e686] [cursor=pointer]:
                                - /url: "#"
                      - group "System notification" [ref=e687]:
                        - generic [ref=e688]:
                          - generic "Open card" [ref=e690] [cursor=pointer]:
                            - img [ref=e691]
                          - generic [ref=e692]:
                            - generic [ref=e693]:
                              - generic "Open card" [ref=e694] [cursor=pointer]:
                                - strong [ref=e695]: Kapila Hettiarachchi - New 17
                              - generic "9/11/2026, 11:07:31 AM" [ref=e696]: "- now"
                            - paragraph [ref=e702]:
                              - text: "This transfer has been created from:"
                              - link "BR-AM/RET/00479" [ref=e703] [cursor=pointer]:
                                - /url: "#"
                      - group "System notification" [ref=e704]:
                        - generic [ref=e705]:
                          - generic "Open card" [ref=e707] [cursor=pointer]:
                            - img [ref=e708]
                          - generic [ref=e709]:
                            - generic [ref=e710]:
                              - generic "Open card" [ref=e711] [cursor=pointer]:
                                - strong [ref=e712]: Kapila Hettiarachchi - New 17
                              - generic "9/11/2026, 11:07:31 AM" [ref=e713]: "- now"
                            - paragraph [ref=e719]: Transfer created
      - dialog [active] [ref=e720]:
        - generic [ref=e721]:
          - banner [ref=e722]:
            - heading "Validation Error" [level=4] [ref=e723]
            - button "Close" [ref=e724] [cursor=pointer]
          - contentinfo [ref=e725]:
            - button "Close" [ref=e726] [cursor=pointer]
          - main [ref=e727]:
            - alert [ref=e728]:
              - paragraph [ref=e729]: "The serial number has already been assigned: Product: [JMC6] Multi Chopper 6Hp (Tractor Type), Serial Number: 0207_001"
    - generic:
      - paragraph: Press esc to exit full screen
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
  9   | /**
  10  |  * Injects a fixed, blinking banner at the bottom of the page showing the
  11  |  * given test name. Uses page.addInitScript so it re-injects itself on
  12  |  * every navigation/reload for the lifetime of this `page` — call it once,
  13  |  * near the top of a test, right after `page` is available.
  14  |  */
  15  | export async function showTestNameBanner(page: Page, testName: string): Promise<void> {
  16  |   await page.addInitScript((name: string) => {
  17  |     const render = () => {
  18  |       if (!document.body) { requestAnimationFrame(render); return; }
  19  |       const existing = document.getElementById('__pw_test_name_banner__');
  20  |       if (existing) existing.remove();
  21  |       const style = document.createElement('style');
  22  |       style.textContent = `
  23  |         @keyframes pw-test-name-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
  24  |         #__pw_test_name_banner__ {
  25  |           position: fixed; left: 0; right: 0; bottom: 0; z-index: 2147483647;
  26  |           background: #90ee90; color: #000; font: bold 14px/1.4 sans-serif;
  27  |           text-align: center; padding: 6px 10px; pointer-events: none;
  28  |         }
  29  |         #__pw_test_name_banner__ span {
  30  |           animation: pw-test-name-blink 1s steps(1, end) infinite;
  31  |         }
  32  |       `;
  33  |       const banner = document.createElement('div');
  34  |       banner.id = '__pw_test_name_banner__';
  35  |       const label = document.createElement('span');
  36  |       label.textContent = `▶ Running: ${name}`;
  37  |       banner.appendChild(label);
  38  |       document.head.appendChild(style);
  39  |       document.body.appendChild(banner);
  40  |     };
  41  |     render();
  42  |   }, testName);
  43  | }
  44  | 
  45  | export async function loginAndSelectCompany(page: Page): Promise<void> {
  46  |   const email = process.env.ODOO_EMAIL || '';
  47  |   const password = process.env.ODOO_PASSWORD || '';
  48  | 
  49  |   await page.goto(`${BASE_URL}/web/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  50  |   await page.fill('input[name="login"]', email);
  51  |   await page.fill('input[name="password"]', password);
  52  |   await page.locator('button[type="submit"]:not(.oe_search_button)').first().click();
  53  |   await page.waitForSelector('.o_main_navbar, .o_home_menu, .o_app', { timeout: 30_000 });
  54  | }
  55  | 
  56  | /**
  57  |  * Wait until Odoo 17's activity indicators are idle.
  58  |  *
  59  |  * Odoo 17 exposes overlapping loading signals:
  60  |  *   1. `.o_loading_indicator` — the bottom-right "Loading" toast. Odoo
  61  |  *      appears it ~400ms AFTER an RPC starts (debounced to prevent
  62  |  *      flashing on fast calls) and fades out with `.o-fade-leave` when
  63  |  *      the pending-request count drops to 0. On the staging build we
  64  |  *      also see the toast rendered without that class — it just says
  65  |  *      "Loading" — so we also check `.o_notification` bottom-right
  66  |  *      toasts and any text node containing "Loading".
  67  |  *   2. `.o_blockUI` (and body.o_ui_blocked) — the full-screen blocker
  68  |  *      used by `ui.block()` during form saves / server actions.
  69  |  *   3. `ui.isBlocked` on the Owl `ui` service — programmatic flag.
  70  |  *
  71  |  * Strategy (per user request): after any user action, grace-wait up to
  72  |  * `graceMs` (default 1000ms) for the loading indicator to APPEAR. If
  73  |  * it does, wait for it to fully disappear before returning. If it
  74  |  * doesn't appear in the grace window, we're already idle.
  75  |  *
  76  |  * This handles both fast RPCs (< 400ms, no indicator) and slow ones
  77  |  * (indicator appears and lingers) with a single predictable pattern.
  78  |  */
  79  | export async function waitForLoading(
  80  |   page: Page,
  81  |   timeoutMs = 60_000,
  82  |   graceMs = 1_000,
  83  | ): Promise<void> {
  84  |   // Wrapped so a transient "execution context was destroyed" error (page is
  85  |   // mid-navigation when we poll) doesn't blow up the whole wait — we just
  86  |   // treat that instant as "still loading" and re-check on the next tick.
  87  |   // If the page/context is actually gone, rethrow so the caller fails fast
  88  |   // instead of polling pointlessly until timeoutMs.
  89  |   const indicatorVisibleNow = async (): Promise<boolean> => {
  90  |     try {
  91  |       return await evalIndicatorVisible();
  92  |     } catch (err: any) {
  93  |       if (page.isClosed()) throw err;
  94  |       const msg = String(err?.message ?? '');
  95  |       if (/context (was )?destroyed|Execution context/i.test(msg)) return true;
  96  |       throw err;
  97  |     }
  98  |   };
  99  | 
> 100 |   const evalIndicatorVisible = () => page.evaluate(() => {
      |                                           ^ Error: page.evaluate: Target page, context or browser has been closed
  101 |     const w = window as any;
  102 |     // Standard Odoo 17 selector
  103 |     const indicator = document.querySelector('.o_loading_indicator');
  104 |     if (indicator) {
  105 |       const style = getComputedStyle(indicator);
  106 |       if (style.display !== 'none'
  107 |           && style.visibility !== 'hidden'
  108 |           && !indicator.classList.contains('o-fade-leave')) {
  109 |         return true;
  110 |       }
  111 |     }
  112 |     // Backup selector — bottom-right "Loading" toast on some builds
  113 |     // renders as a plain badge/notification with visible "Loading" text
  114 |     for (const el of Array.from(document.querySelectorAll(
  115 |       '.o_notification, .o_loading, [class*="loading" i]'
  116 |     ))) {
  117 |       const style = getComputedStyle(el);
  118 |       if (style.display === 'none' || style.visibility === 'hidden') continue;
  119 |       const txt = (el as HTMLElement).innerText?.trim() ?? '';
  120 |       if (/loading/i.test(txt)) {
  121 |         // Ignore matches inside larger unrelated blocks — only bottom
  122 |         // right of viewport (bottom > vh - 200, right within 250px)
  123 |         const r = (el as HTMLElement).getBoundingClientRect();
  124 |         if (r.bottom >= window.innerHeight - 220 && r.right >= window.innerWidth - 300) {
  125 |           return true;
  126 |         }
  127 |       }
  128 |     }
  129 |     // Full-screen blocker checks
  130 |     if (document.querySelector('.o_blockUI')) return true;
  131 |     if (document.body.classList.contains('o_ui_blocked')) return true;
  132 |     try {
  133 |       if (w.odoo?.__WOWL_DEBUG__?.root?.env?.services?.ui?.isBlocked) return true;
  134 |     } catch { /* debug hook may not exist in production mode */ }
  135 |     return false;
  136 |   });
  137 | 
  138 |   // Phase 1: grace-wait for the indicator to appear.
  139 |   const graceDeadline = Date.now() + graceMs;
  140 |   let appeared = false;
  141 |   while (Date.now() < graceDeadline) {
  142 |     if (await indicatorVisibleNow()) { appeared = true; break; }
  143 |     await page.waitForTimeout(80);
  144 |   }
  145 | 
  146 |   // Phase 2: if it appeared, wait for it to fully disappear.
  147 |   if (appeared) {
  148 |     const deadline = Date.now() + timeoutMs;
  149 |     while (Date.now() < deadline) {
  150 |       if (!(await indicatorVisibleNow())) {
  151 |         // Small stability window — sometimes the indicator flicks off
  152 |         // for ~50ms between chained RPCs. Re-check.
  153 |         await page.waitForTimeout(200);
  154 |         if (!(await indicatorVisibleNow())) return;
  155 |       }
  156 |       await page.waitForTimeout(100);
  157 |     }
  158 |     throw new Error(`waitForLoading: indicator still visible after ${timeoutMs}ms`);
  159 |   }
  160 |   // No indicator appeared within grace — already idle.
  161 | }
  162 | 
  163 | /**
  164 |  * Wait until the action manager has landed on a real, rendered view
  165 |  * (list / kanban / form) OR raised a dialog. Use this after actions that
  166 |  * transition between views (breadcrumb clicks, smart buttons, top-nav
  167 |  * clicks) — waitForLoading alone can return during the momentary gap
  168 |  * between "action manager fetch done" and "view arch rendered", which
  169 |  * looks idle from the RPC perspective but leaves the DOM without the
  170 |  * expected view container.
  171 |  */
  172 | export async function waitForView(page: Page, timeoutMs = 20_000): Promise<void> {
  173 |   await waitForLoading(page, timeoutMs);
  174 |   await page.waitForSelector(
  175 |     '.o_list_view, .o_kanban_view, .o_form_view, .o_dialog',
  176 |     { timeout: timeoutMs }
  177 |   );
  178 |   await waitForLoading(page, timeoutMs);
  179 | }
  180 | 
  181 | export async function dismissAnyModal(page: Page): Promise<void> {
  182 |   const closeBtn = page.locator('.o_dialog button').filter({ hasText: /^Close$/i }).first();
  183 |   if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
  184 |     await closeBtn.click();
  185 |     await page.waitForTimeout(300);
  186 |   }
  187 | }
  188 | 
  189 | export async function fillMany2one(page: Page, fieldName: string, value: string): Promise<void> {
  190 |   const widget = page.locator(`[name="${fieldName}"]`).first();
  191 | 
  192 |   // Selection <select> — pick by visible text
  193 |   const selEl = widget.locator('select').first();
  194 |   if (await selEl.count() > 0) {
  195 |     const options = await selEl.evaluate((s: HTMLSelectElement) =>
  196 |       Array.from(s.options).map(o => ({ value: o.value, text: o.text.trim() }))
  197 |     );
  198 |     const match = options.find(o => o.text.toLowerCase().includes(value.toLowerCase()));
  199 |     if (match) await selEl.selectOption(match.value);
  200 |     await waitForLoading(page);
```