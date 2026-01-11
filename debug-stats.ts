
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    console.log('--- Server Time Info ---')
    console.log('Current Time:', now.toString())
    console.log('Today Start:', today.toString())
    console.log('Tomorrow Start:', tomorrow.toString())
    console.log('Month Start:', firstDayOfMonth.toString())
    console.log('Month End:', lastDayOfMonth.toString())

    console.log('\n--- All Expenses ---')
    const expenses = await prisma.expense.findMany({
        orderBy: { expenseDate: 'desc' }
    })

    expenses.forEach(e => {
        console.log(`ID: ${e.id}, Amount: ${e.amount}, Desc: ${e.description}`)
        console.log(`   Expense Date: ${e.expenseDate.toString()}`)
        console.log(`   Created At:   ${e.createdAt.toString()}`)

        const isToday = e.expenseDate >= today && e.expenseDate < tomorrow
        const isMonthly = e.expenseDate >= firstDayOfMonth && e.expenseDate <= lastDayOfMonth

        console.log(`   Matches Today? ${isToday}`)
        console.log(`   Matches Monthly? ${isMonthly}`)
    })

    console.log('\n--- Query Tests ---')
    const todayExpenses = await prisma.expense.findMany({
        where: { expenseDate: { gte: today, lt: tomorrow } }
    })
    console.log('Today Query Count:', todayExpenses.length)
    console.log('Today Sum:', todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0))

    const monthlyExpenses = await prisma.expense.findMany({
        where: { expenseDate: { gte: firstDayOfMonth, lte: lastDayOfMonth } }
    })
    console.log('Monthly Query Count:', monthlyExpenses.length)
    console.log('Monthly Sum:', monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
