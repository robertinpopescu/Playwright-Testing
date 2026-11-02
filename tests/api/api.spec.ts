import { API_BASE_URL } from "../../fixtures/api"
import { expect, test } from "../../fixtures"
import { ownerData, PET_BIRTH_DATE, unique, uniqueName, visitData } from "../../test-data/builders"

const COLLECTIONS = ["owners", "pets", "visits", "vets", "pettypes", "specialties"]
const DEFAULT_RESPONSE_THRESHOLD_MS = 5000

test.describe("Owners API", { tag: "@api" }, () => {
  test("API-001 List owners", { tag: "@smoke" }, async ({ api }) => {
    const response = await api.get("owners")

    expect(response.status()).toBe(200)
    const owners = await response.json()
    expect(Array.isArray(owners)).toBe(true)
    for (const owner of owners) {
      expect(owner).toEqual(expect.objectContaining({
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        address: expect.any(String),
        city: expect.any(String),
        telephone: expect.any(String),
        pets: expect.any(Array)
      }))
    }
  })

  test("API-002 Search owners by last name", async ({ api, data }) => {
    const owner = await data.owner()

    for (const lastName of [owner.lastName, owner.lastName.toLowerCase()]) {
      const response = await api.get("owners", { params: { lastName } })
      expect(response.status()).toBe(200)
      const owners: { id: number, lastName: string }[] = await response.json()
      expect(owners.map(item => item.id)).toContain(owner.id)
      for (const item of owners) expect(item.lastName.toLowerCase().startsWith(lastName.toLowerCase())).toBe(true)
    }
  })

  test("API-003 Owner search without a match returns 404 (current behaviour)", { tag: "@negative" }, async ({ api }) => {
    test.info().annotations.push({
      type: "current-behaviour",
      description: "OBS-001 – convention would be 200 with []; this test documents the current 404 so a change is noticed (docs/BUG-REPORTS.md#obs-001)"
    })

    const response = await api.get("owners", { params: { lastName: `Zz${unique()}` } })

    expect(response.status()).toBe(404)
  })

  test("API-004 Create, read and delete an owner", async ({ api, data }) => {
    const input = ownerData()

    const created = await api.post("owners", { data: input })
    expect(created.status()).toBe(201)
    const owner = await created.json()
    data.track("owners", owner.id)
    expect(owner).toMatchObject({ ...input, id: expect.any(Number), pets: [] })

    const read = await api.get(`owners/${owner.id}`)
    expect(read.status()).toBe(200)
    expect(await read.json()).toMatchObject(input)

    expect((await api.delete(`owners/${owner.id}`)).status()).toBe(204)
    expect((await api.get(`owners/${owner.id}`)).status()).toBe(404)
  })

  test("API-005 Update an owner", async ({ api, data }) => {
    const owner = await data.owner()
    const { pets, ...fields } = owner

    const response = await api.put(`owners/${owner.id}`, { data: { ...fields, city: "Editville" } })

    expect(response.status()).toBe(204)
    expect((await (await api.get(`owners/${owner.id}`)).json()).city).toBe("Editville")
  })

  test("API-006 Unknown owner ID", { tag: "@negative" }, async ({ api }) => {
    expect((await api.get("owners/999999999")).status()).toBe(404)
  })
})

test.describe("Pets and visits API", { tag: "@api" }, () => {
  test("API-007 Create a pet for an owner", async ({ api, data, petclinic }) => {
    const owner = await data.owner()
    const type = await petclinic.petType("dog")
    const name = uniqueName("Rex")

    const created = await api.post(`owners/${owner.id}/pets`, { data: { name, birthDate: PET_BIRTH_DATE.api, type } })
    expect(created.status()).toBe(201)
    const pet = await created.json()
    data.track("pets", pet.id)

    const read = await api.get(`pets/${pet.id}`)
    expect(read.status()).toBe(200)
    expect(await read.json()).toMatchObject({ name, birthDate: PET_BIRTH_DATE.api, type, ownerId: owner.id })
  })

  test("API-008 Update and delete a pet", async ({ api, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const name = uniqueName("Max")

    expect((await api.put(`pets/${pet.id}`, { data: { ...pet, name } })).status()).toBe(204)
    expect((await (await api.get(`pets/${pet.id}`)).json()).name).toBe(name)

    expect((await api.delete(`pets/${pet.id}`)).status()).toBe(204)
    expect((await api.get(`pets/${pet.id}`)).status()).toBe(404)
  })

  test("API-009 Create, update and delete a visit", async ({ api, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const input = visitData()

    const created = await api.post(`owners/${owner.id}/pets/${pet.id}/visits`, { data: input })
    expect(created.status()).toBe(201)
    const visit = await created.json()
    data.track("visits", visit.id)
    expect(visit).toMatchObject({ ...input, petId: pet.id })

    expect((await api.put(`visits/${visit.id}`, { data: { ...visit, description: "Edited" } })).status()).toBe(204)
    expect((await (await api.get(`visits/${visit.id}`)).json()).description).toBe("Edited")

    expect((await api.delete(`visits/${visit.id}`)).status()).toBe(204)
    expect((await api.get(`visits/${visit.id}`)).status()).toBe(404)
  })

  test("API-010 Visit with an invalid date is rejected", { tag: "@negative" }, async ({ api, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)

    const response = await api.post(`owners/${owner.id}/pets/${pet.id}/visits`, { data: { date: "Invalid date", description: "x" } })

    expect(response.status()).toBe(400)
    expect((await petclinic.getPet(pet.id)).visits).toHaveLength(0)
  })
})

test.describe("Reference data API", { tag: "@api" }, () => {
  for (const resource of ["pettypes", "specialties"] as const) {
    const id = resource === "pettypes" ? "API-011 Pet type CRUD" : "API-012 Specialty CRUD"
    test(id, async ({ api, data }) => {
      const name = uniqueName("Crud")

      const created = await api.post(resource, { data: { name } })
      expect(created.status()).toBe(201)
      const record = await created.json()
      data.track(resource, record.id)
      expect(await (await api.get(`${resource}/${record.id}`)).json()).toEqual({ id: record.id, name })

      const renamed = uniqueName("Renamed")
      expect((await api.put(`${resource}/${record.id}`, { data: { id: record.id, name: renamed } })).status()).toBe(204)
      expect((await (await api.get(`${resource}/${record.id}`)).json()).name).toBe(renamed)

      expect((await api.delete(`${resource}/${record.id}`)).status()).toBe(204)
      expect((await api.get(`${resource}/${record.id}`)).status()).toBe(404)
    })
  }

  test("API-013 Vet CRUD with specialties", async ({ api, data, petclinic }) => {
    const radiology = await petclinic.specialty("radiology")
    const surgery = await petclinic.specialty("surgery")
    const input = { firstName: uniqueName(), lastName: uniqueName(), specialties: [radiology] }

    const created = await api.post("vets", { data: input })
    expect(created.status()).toBe(201)
    const vet = await created.json()
    data.track("vets", vet.id)
    expect(await (await api.get(`vets/${vet.id}`)).json()).toMatchObject(input)

    expect((await api.put(`vets/${vet.id}`, { data: { ...vet, specialties: [radiology, surgery] } })).status()).toBe(204)
    const updated = await (await api.get(`vets/${vet.id}`)).json()
    expect(updated.specialties.map((item: { name: string }) => item.name).sort()).toEqual(["radiology", "surgery"])

    expect((await api.delete(`vets/${vet.id}`)).status()).toBe(204)
    expect((await api.get(`vets/${vet.id}`)).status()).toBe(404)
  })

  const INVALID_PAYLOADS = [
    { resource: "owners", label: "owner without lastName", payload: { firstName: uniqueName(), address: "1 Test St", city: "Testville", telephone: "6085550000" } },
    { resource: "pettypes", label: "pet type without name", payload: {} },
    { resource: "vets", label: "vet without firstName", payload: { lastName: uniqueName(), specialties: [] } },
    { resource: "specialties", label: "specialty without name", payload: {} }
  ] as const
  for (const { resource, label, payload } of INVALID_PAYLOADS) {
    test(`API-014 Missing required fields are rejected: ${label}`, { tag: "@negative" }, async ({ api, data }) => {
      const response = await api.post(resource, { data: payload })

      if (response.ok()) data.track(resource, (await response.json()).id)
      expect(response.status()).toBe(400)
    })
  }
})

test.describe("API access and consistency", { tag: "@api" }, () => {
  test("API-015 Requests without a token are rejected", { tag: "@security" }, async ({ playwright }) => {
    const anonymous = await playwright.request.newContext({ baseURL: API_BASE_URL })
    try {
      for (const resource of COLLECTIONS) {
        const response = await anonymous.get(resource)
        expect(response.status(), resource).toBe(401)
        expect(await response.text(), resource).not.toContain("firstName")
      }
    } finally {
      await anonymous.dispose()
    }
  })

  test("API-016 Requests with an invalid token are rejected", { tag: "@security" }, async ({ playwright }) => {
    const invalid = await playwright.request.newContext({ baseURL: API_BASE_URL, extraHTTPHeaders: { Authorization: "Bearer invalid-token" } })
    try {
      for (const resource of COLLECTIONS) expect((await invalid.get(resource)).status(), resource).toBe(401)
    } finally {
      await invalid.dispose()
    }
  })

  test("API-017 UI and API show the same data", { tag: "@regression" }, async ({ ownersPage, vetsPage, petTypesPage, specialtiesPage, petclinic }) => {
    const [owners, vets, petTypes, specialties] = await Promise.all([
      petclinic.listOwners(), petclinic.listVets(), petclinic.listPetTypes(), petclinic.listSpecialties()
    ])

    await ownersPage.goto()
    await expect(ownersPage.ownerRows).toHaveCount(owners.length)
    await expect(ownersPage.ownerRows.getByRole("link")).toHaveText(owners.map(owner => `${owner.firstName} ${owner.lastName}`))
    await vetsPage.goto()
    await expect(vetsPage.rows).toHaveCount(vets.length)
    await petTypesPage.goto()
    await expect.poll(() => petTypesPage.names()).toEqual(petTypes.map(type => type.name))
    await specialtiesPage.goto()
    await expect.poll(() => specialtiesPage.names()).toEqual(specialties.map(specialty => specialty.name))
  })

  test("API-018 Response times are reasonable", async ({ api }) => {
    const threshold = Number(process.env.API_RESPONSE_THRESHOLD_MS ?? DEFAULT_RESPONSE_THRESHOLD_MS)
    expect(threshold, "API_RESPONSE_THRESHOLD_MS must be a positive number").toBeGreaterThan(0)

    for (const resource of ["owners", "vets", "pettypes"]) {
      const started = Date.now()
      const response = await api.get(resource)
      const elapsed = Date.now() - started
      test.info().annotations.push({ type: "response-time", description: `GET ${resource}: ${elapsed} ms (threshold ${threshold} ms)` })

      expect(response.status(), resource).toBe(200)
      // Soft: a slow response is reported but does not stop the test or the run on its own
      expect.soft(elapsed, `GET ${resource} response time in ms`).toBeLessThanOrEqual(threshold)
    }
  })
})
