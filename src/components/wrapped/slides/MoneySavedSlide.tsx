import { useMemo } from 'react';
import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

function formatCurrency(amount: number): string {
	return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function MoneySavedSlide({ data }: SlideProps) {
	const transactions = data?.transactions ?? [];

	const {
		requiredPlanType,
		requiredPlanCost,
		spentOnRequiredPlan,
		savedIfNotRequired,
		neighborhoodSpent,
		neighborhoodCashEquivalent,
		neighborhoodDiscountSavings,
		onlyUsedFlyerExpress,
		flexSpendPool,
		flexRemaining,
		savedIfSpendAllFlex,
			standardOverPlanSpending,
			standardPlanSaved,
			flyerSpent,
	} = useMemo(() => {
		function getAccountNameLower(t: any): string {
			return String(t?.accountName ?? '').toLowerCase();
		}
		function isStandardPlan(nameLower: string): boolean {
			// Includes common variants: "standard", "meal plan" etc, but not "flex"
			return nameLower.includes('standard') || (nameLower.includes('meal') && !nameLower.includes('flex'));
		}
		function isFlexPlan(nameLower: string): boolean {
			return nameLower.includes('flex');
		}
		function isNeighborhoodPlan(nameLower: string): boolean {
			return nameLower.includes('neighborhood');
		}
		function isFlyerExpress(nameLower: string): boolean {
			return nameLower.includes('flyer express') || nameLower.includes('flyer');
		}
		function isEmporium(locationName: string | undefined): boolean {
			return String(locationName ?? '').toLowerCase().includes('emporium');
		}

		let spentStandard = 0;
		let refundsStandard = 0;
		let spentFlex = 0;
		let refundsFlex = 0;
		let spentNeighborhood = 0;
		let refundsNeighborhood = 0;
		let spentFlyer = 0;
		let refundsFlyer = 0;

		let neighborhoodPreCashTotal = 0;

		for (const t of transactions) {
			const amt = typeof t?.amount === 'number' ? t.amount : 0;
			const acct = getAccountNameLower(t);
			if (isStandardPlan(acct)) {
				if (amt > 0) spentStandard += amt;
				else if (amt < 0) refundsStandard += Math.abs(amt);
			} else if (isFlexPlan(acct)) {
				if (amt > 0) spentFlex += amt;
				else if (amt < 0) refundsFlex += Math.abs(amt);
			} else if (isNeighborhoodPlan(acct)) {
				if (amt > 0) spentNeighborhood += amt;
				else if (amt < 0) refundsNeighborhood += Math.abs(amt);
				// Estimate what cash price would have been for each positive transaction
				if (amt > 0) {
					if (isEmporium(t?.locationName)) {
						// no discount at The Emporium JWO
						neighborhoodPreCashTotal += amt;
					} else {
						// if 10% off, post-discount amount = 0.9 * preDiscount
						neighborhoodPreCashTotal += amt / 0.9;
					}
				}
			} else if (isFlyerExpress(acct)) {
				if (amt > 0) spentFlyer += amt;
				else if (amt < 0) refundsFlyer += Math.abs(amt);
			}
		}

		const netStandard = Math.max(0, spentStandard - refundsStandard);
		const netFlex = Math.max(0, spentFlex - refundsFlex);
		const netNeighborhood = Math.max(0, spentNeighborhood - refundsNeighborhood);
		const netFlyer = Math.max(0, spentFlyer - refundsFlyer);

		// Detect which required plan the student likely had (if any)
		// Priority: Standard if any activity, else Flex if any activity
		let requiredPlanType: 'standard' | 'flex' | null = null;
		let spentOnRequiredPlan = 0;
		if (netStandard > 0) {
			requiredPlanType = 'standard';
			spentOnRequiredPlan = netStandard;
		} else if (netFlex > 0) {
			requiredPlanType = 'flex';
			spentOnRequiredPlan = netFlex;
		} else {
			requiredPlanType = null;
			spentOnRequiredPlan = 0;
		}

		// Costs from the spec
		const STANDARD_COST = 3395;
		const FLEX_COST = 3395; // Flex costs the same amount
		const FLEX_SPEND_POOL = 2595; // Flex dollars available to spend
		// Flex provides $2,595 to spend; used only for interpretation, not mandatory in calculation
		// We compute "saved if not required" as: planCost - actual spend on that plan (lower bound 0)
		const requiredPlanCost =
			requiredPlanType === 'standard' ? STANDARD_COST : requiredPlanType === 'flex' ? FLEX_COST : 0;
		const savedIfNotRequired = Math.max(0, requiredPlanCost - spentOnRequiredPlan);
		const flexRemaining = Math.max(0, FLEX_SPEND_POOL - (requiredPlanType === 'flex' ? spentOnRequiredPlan : 0));
		const savedIfSpendAllFlex = Math.max(0, FLEX_COST - FLEX_SPEND_POOL); // = $800 if Flex costs $3395 and pool is $2595
		const standardOverPlanSpending =
			requiredPlanType === 'standard' ? Math.max(0, spentOnRequiredPlan - STANDARD_COST) : 0;
		const standardPlanSaved =
			requiredPlanType === 'standard' ? Math.max(0, spentOnRequiredPlan - STANDARD_COST) : 0;

		// Neighborhood plan savings: 10% discount everywhere except The Emporium "just walk out".
		// If transaction amounts are post-discount, the savings vs cash is amount/9 (10% of pre-discount).
		const neighborhoodCashEquivalent = Math.max(0, neighborhoodPreCashTotal);
		const neighborhoodSavings = Math.max(0, neighborhoodCashEquivalent - netNeighborhood);
		const onlyUsedFlyerExpress = netFlyer > 0 && netStandard === 0 && netFlex === 0 && netNeighborhood === 0;

		return {
			requiredPlanType,
			requiredPlanCost,
			spentOnRequiredPlan,
			savedIfNotRequired,
			neighborhoodSpent: netNeighborhood,
			neighborhoodCashEquivalent,
			neighborhoodDiscountSavings: neighborhoodSavings,
			onlyUsedFlyerExpress,
			flexSpendPool: FLEX_SPEND_POOL,
			flexRemaining,
			savedIfSpendAllFlex,
			standardOverPlanSpending,
			standardPlanSaved,
			flyerSpent: netFlyer,
		};
	}, [transactions]);

	const hasAny = (data?.totalCount ?? 0) > 0;
	const requiredPlanLabel =
		requiredPlanType === 'standard'
			? 'Standard Plan'
			: requiredPlanType === 'flex'
			? 'Flex Plan'
			: 'No Required Plan Detected';

	const showRequiredSection =
		hasAny && requiredPlanCost > 0 && (savedIfNotRequired > 0 || standardOverPlanSpending > 0 || requiredPlanType === 'flex');
	const showNeighborhoodSection = hasAny && neighborhoodSpent > 0 && !showRequiredSection;
	const showFlyerOnlyNote = hasAny && !showRequiredSection && !showNeighborhoodSection && onlyUsedFlyerExpress;

	return (
		<StorySlide className="bg-[#ff4242] text-white font-bold p-0">
			<div className="w-full max-w-md mx-auto px-6">
				<div className="mb-6 sm:mb-8">
					<div className="mt-2 text-4xl sm:text-5xl leading-tight">Your Bottom Line</div>
				</div>

				<div className="grid grid-cols-1 gap-4 mb-8">
					{showRequiredSection ? (
						<div className="grid grid-cols-1 gap-4">
							{requiredPlanLabel === 'Flex Plan' ? (
								<>
									<div className="border-2 border-white p-5 text-left">
										<div className="text-base leading-relaxed">
											Your Flex plan cost{' '}
											<span className="text-2xl">{formatCurrency(requiredPlanCost)}</span> and you were given{' '}
											<span className="text-2xl">{formatCurrency(flexSpendPool)}</span> to spend.
										</div>
									</div>
									<div className="border-2 border-white p-5 text-left">
										<div className="text-base leading-relaxed">
											You spent <span className="text-2xl">{formatCurrency(spentOnRequiredPlan)}</span> on that plan.
										</div>
									</div>
									<div className="border-2 border-white p-5 text-left">
										<div className="text-base leading-relaxed">
											If the plan weren’t required, you’d save{' '}
											<span className="text-2xl">{formatCurrency(savedIfSpendAllFlex)}</span>, even after spending your remaining{' '}
											<span className="text-2xl">{formatCurrency(flexRemaining)}</span> this spring.
										</div>
									</div>
								</>
							) : (
								<>
									<div className="border-2 border-white p-5 text-left">
										<div className="text-base leading-relaxed">
											Your standard plan cost <span className="text-2xl">{formatCurrency(requiredPlanCost)}</span>.
										</div>
									</div>
									<div className="border-2 border-white p-5 text-left">
										<div className="text-base leading-relaxed">
											You spent <span className="text-2xl">{formatCurrency(spentOnRequiredPlan)}</span> on that plan.
										</div>
									</div>
									<div className="border-2 border-white p-5 text-left">
										<div className="text-base leading-relaxed">
											{spentOnRequiredPlan < requiredPlanCost ? (
												<>
													If the university didn’t require a meal plan, you would’ve saved{' '}
													<span className="text-2xl">{formatCurrency(savedIfNotRequired)}</span>.
												</>
											) : (
												<>
													You saved <span className="text-2xl">{formatCurrency(standardPlanSaved)}</span>.
												</>
											)}
										</div>
									</div>
								</>
							)}
						</div>
					) : null}

					{showNeighborhoodSection ? (
						<div className="grid grid-cols-1 gap-4">
							<div className="border-2 border-white p-5 text-left">
								<div className="text-base leading-relaxed">
									You spent <span className="text-2xl">{formatCurrency(neighborhoodSpent)}</span> on your Neighborhood plan.
								</div>
							</div>
							<div className="border-2 border-white p-5 text-left">
								<div className="text-base leading-relaxed">
									If you paid cash you would’ve paid{' '}
									<span className="text-2xl">{formatCurrency(neighborhoodCashEquivalent)}</span>.
								</div>
							</div>
							<div className="border-2 border-white p-5 text-left">
								<div className="text-base leading-relaxed">
									You saved <span className="text-2xl">{formatCurrency(neighborhoodDiscountSavings)}</span>.
								</div>
							</div>
						</div>
					) : null}

					{showFlyerOnlyNote ? (
						<div className="grid grid-cols-1 gap-4">
							<div className="border-2 border-white p-5 text-left">
								<div className="text-base leading-relaxed">
									You spent <span className="text-2xl">{formatCurrency(flyerSpent)}</span> on Flyer Express.
								</div>
							</div>
							<div className="border-2 border-white p-5 text-left">
								<div className="text-base leading-relaxed">
									Since Flyer Express doesn’t get you a discount, the amount you spent is the same as if you paid cash.
								</div>
							</div>
						</div>
					) : null}
				</div>

				<div className="mt-8 flex items-center justify-center">
					<div className="text-sm underline decoration-white pointer-events-none">https://wrapped.menu</div>
				</div>
			</div>
		</StorySlide>
	);
}


