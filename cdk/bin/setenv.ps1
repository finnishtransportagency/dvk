param (
    [string]$environment
)

if (-not $environment) {
    Write-Output "Usage: .\setenv.ps1 [environment name]"
    Write-Output "Parameters:"
    Write-Output "  environment name - name of AWS environment, for example dev"
} else {
    $env:ENVIRONMENT = $environment
    $env:NODE_OPTIONS = "--max_old_space_size=4096 --max-old-space-size=4096"
    $env:AWS_DEFAULT_REGION = "eu-west-1"
    
    $awsAccountIdTmp = (aws sts get-caller-identity --output json 2> $null | Select-String -Pattern '"Account": "(\d+)"' | ForEach-Object { $_.Matches.Groups[1].Value })
    
    Write-Output "Following environment variables set:"
    Write-Output "ENVIRONMENT=$environment"
    Write-Output "NODE_OPTIONS=$($env:NODE_OPTIONS)"
    Write-Output "AWS_DEFAULT_REGION=$($env:AWS_DEFAULT_REGION)"
    
    if ($awsAccountIdTmp) {
        $env:AWS_ACCOUNT_ID = $awsAccountIdTmp
        Write-Output "AWS_ACCOUNT_ID=$($env:AWS_ACCOUNT_ID)"
    }
}