if (-not $env:ENVIRONMENT) {
    Write-Output "Environment variable ENVIRONMENT missing. Use setenv.ps1 script to set it."
} else {
    $alb = (aws cloudformation list-exports --output json 2> $null | Select-String -Pattern "DvkALB-$($env:ENVIRONMENT)-" | ForEach-Object { $_.Line.Split('"')[3] })
    
    if ($alb) {
        Start-Process -FilePath "aws" -ArgumentList "ssm start-session --target i-0acf0d2740c6b2938 --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters host=$alb,portNumber=80,localPortNumber=8080" -PassThru
        Write-Output "Port forwarding to $alb started on port 8080"
    } else {
        Write-Output "Make sure you have logged in your AWS account or environment $env:ENVIRONMENT exists."
    }
}