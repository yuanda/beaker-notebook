Feature: Market Place Searching
As a researcher, I want to be able to use the market place.

  Background:
    Given I'm signed in as a researcher

  Scenario: See a market item
    When there is a market item
    And I view the market search
    Then I should see 1 market item on the market list page

  Scenario: Filtering market items by text
    When there is a market item
    And I view the market search
    And I filter the market page by "this will not match"
    Then I should see 0 market items on the market list page

  Scenario: Filtering market items by tag
    When there is a market item with the format "MAGIC"
    And there is a market item with the format "CSV"
    And I view the market search
    And I filter by search by selecting the "MAGIC" formats
    Then I should see 1 market item on the market list page

  Scenario: Filtering market items by format
    When there is a market item with the tags "cat,dog,human"
    And I view the market search
    And I filter by search by selecting the "cat,dog,human" tags
    Then I should see 1 market item on the market list page

  Scenario: Filtering market items by vendor
    When there is a market item with the vendor "George data"
    And there is a market item with the vendor "Doge industries"
    And I view the market search
    And I filter by search by selecting the "George data" vendors
    Then I should see 1 market item on the market list page

  Scenario: Stacking market item filters
    When there is a market item with the vendor "George data"
    And there is a market item with the format "MAGIC"
    And I view the market search
    And I filter by search by selecting the "George data" vendors
    Then I should see 1 market item on the market list page
    And I filter by search by selecting the "MAGIC" formats
    Then I should see 0 market items on the market list page
    And I filter the market page by "Credit"
    Then I should see 0 market items on the market list page

  Scenario: Paginated market items
    When there is 22 market items
    And I view the market search
    Then I should see 10 market items on the market list page
    And I should see 22 total results

  Scenario: Market place filter persistence
    When there is a market item with the tags "cat,dog,human"
    And I view the market search
    And I filter by search by selecting the "cat" tags
    And I view the first market item
    And I return to the market results
    Then I should see the "cat" tags selected

  Scenario: Market items text search
    Given I have the following market items:
      | title                  |
      | Credit Card Complaints |
      | Crime in Canada        |
    When I view the market search
    And I search marketplace by "canada"
    Then I should see 1 market item on the market list page
    And I should see the "Crime in Canada" market item on the market list page

  Scenario: Market items text search for non-matching term
    Given I have the following market items:
      | title                  |
      | Crime in Canada        |
    When I view the market search
    And I search marketplace by "crime in mexico"
    Then I should see 0 market items on the market list page

  Scenario: Clear market items text search
    Given I have the following market items:
      | title                  |
      | Credit Card Complaints |
      | Crime in Canada        |
    When I view the market search
    And I search marketplace by "canada"
    And I search marketplace by ""
    Then I should see 2 market items on the market list page

  Scenario: Related market items
    Given I have the following market items:
      | title                       | tags                      |
      | Quarterly E-commerce Report | finance,e-commerce        |
      | Amazon Annual Report        | amazon,e-commerce,finance |
      | The World Bank Report 2013  | finance,world bank        |
    And I view the market search
    When I view the "Quarterly E-commerce Report" market item
    Then I should see "Amazon Annual Report" is related
    When I view the "Amazon Annual Report" related item
    Then I should see no related items

  Scenario: Data set details description
    Given I have the following market items:
      | title                       | description                              |
      | Quarterly E-commerce Report | All revenue from e-commerce each quarter |
    And I view the market search
    When I view the "Quarterly E-commerce Report" market item
    Then I should see the market description "All revenue from e-commerce each quarter"

  Scenario: Data set details vendor
    Given I have the following market items:
      | title           | vendors             |
      | Delta Quadrant  | Starship Voyager    |
    And I view the market search
    And I view the "Delta Quadrant" market item
    Then I should see the vendor "Starship Voyager"

  Scenario: Data set details format
    Given I have the following market items:
      | title                     | format |
      | US Electricity Statistics | CSV    |
    And I view the market search
    And I view the "US Electricity Statistics" market item
    Then I should see the format "CSV"

  Scenario: Data set details frequency
    Given I have the following market items:
      | title               | updateFrequency |
      | Crime Rates, Canada | Annually        |
    And I view the market search
    And I view the "Crime Rates, Canada" market item
    Then I should see the frequency "Annually"

  Scenario: Data set details tags
    Given I have the following market items:
      | title               | tags               |
      | Crime Rates, Canada | crime,stats,canada |
    And I view the market search
    And I view the "Crime Rates, Canada" market item
    Then I should see the tags "stats,crime,canada"

  Scenario: Market place related tags
    Given I have the following market items:
      | title                      | tags               |
      | Crime Rates, Canada        | crime,stats,canada |
      | Population in Canada       | census,canada      |
      | The World Bank Report 2013 | finance,world bank |
    When I view the market search
    And I filter the market page by "Canada"
    Then I should see the related tags "canada,census,stats,crime"

  Scenario: Market item description in list
    Given I have the following market items:
      | title               | description                               | format |
      | Crime Rates, Canada | Yearly crimes reported per 100,000 people | XML    |
    When I view the market search
    And I filter the market page by "crime"
    Then I should see the following market results
      | title                     | description                               | format | vendors |
      | Crime Rates, Canada       | Yearly crimes reported per 100,000 people | XML    |         |

  Scenario: Market item vendor in list
    Given I have the following market items:
      | title                     | description                               | format | vendors            |
      | Crime Rates, Canada       | Yearly crimes reported per 100,000 people | XML    | Statistics Canada  |
    When I view the market search
    And I filter the market page by "Canada"
    Then I should see the following market results
      | title                     | description                               | format | vendors            |
      | Crime Rates, Canada       | Yearly crimes reported per 100,000 people | XML    | Statistics Canada  |

  Scenario: Market item file path
    Given I have the following market items:
      | title               | remoteFile |
      | Crime Rates, Canada | CRIME.xml  |
    And I view the market search
    When I view the "Crime Rates, Canada" market item
    And I subscribe to the market item
    Then I should see the file path "/s3/CRIME.xml"
