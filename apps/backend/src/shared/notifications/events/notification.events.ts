export class SendEmailEvent {
  constructor(
    public readonly to: string,
    public readonly subject: string,
    public readonly template: string,
    public readonly context: Record<string, any>
  ) {}
}
