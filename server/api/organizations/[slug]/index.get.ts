export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    return toOrganization(organization)
})
